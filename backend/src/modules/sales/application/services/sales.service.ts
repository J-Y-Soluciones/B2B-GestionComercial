// backend/src/modules/sales/application/services/sales.service.ts
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface.js';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface.js';
import type { CreateSaleDto } from '../dtos/create-sale.dto.js';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { NubefactService } from '../../infrastructure/services/nubefact.service.js';
import { ProformaStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,
    private readonly prisma: PrismaService,
    private readonly nubefactService: NubefactService,
  ) {}

  async createSale(dto: CreateSaleDto, sellerId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debe incluir al menos un ítem.');
    }

    if (!dto.payments || dto.payments.length === 0) {
      throw new BadRequestException(
        'Debe registrar al menos un método de pago.',
      );
    }

    // VALIDACIÓN H02: Venta directa con Tier 3 prohibida sin proforma previa
    const hasTier3 = dto.items.some((i) => i.priceTier === 3);
    if (hasTier3 && !dto.proformaId) {
      throw new BadRequestException(
        'Las ventas con Precio 3 (mayorista) requieren obligatoriamente de una proforma aprobada por gerencia.',
      );
    }

    let proformaCodeRef: string | null = null;

    if (dto.proformaId) {
      const proforma = await this.prisma.proforma.findUnique({
        where: { id: dto.proformaId },
      });

      if (!proforma) {
        throw new NotFoundException('La proforma referenciada no existe.');
      }

      if (hasTier3 && proforma.status !== ProformaStatus.APPROVED) {
        throw new BadRequestException(
          'Para procesar una venta con Precio 3, la proforma debe contar con aprobación gerencial previa (APPROVED).',
        );
      }

      if (proforma.status === ProformaStatus.PENDING_APPROVAL) {
        throw new BadRequestException(
          'No se puede procesar la venta: la proforma está pendiente de aprobación gerencial.',
        );
      }

      if (proforma.status === ProformaStatus.REJECTED) {
        throw new BadRequestException(
          'No se puede procesar la venta: la proforma ha sido rechazada.',
        );
      }

      if (proforma.status === ProformaStatus.CONVERTED) {
        throw new BadRequestException(
          'Esta proforma ya fue convertida a venta previamente.',
        );
      }

      if (proforma.expiresAt && new Date(proforma.expiresAt) < new Date()) {
        throw new BadRequestException(
          'La proforma ha caducado (vigencia máxima de 48 horas superada).',
        );
      }

      proformaCodeRef = proforma.code;
    }

    // PROTECCIÓN H01 & H08: Obtener precios oficiales, estado activo y condición fiscal (isTaxable)
    const productIds = dto.items.map((i) => i.productId);
    const productsInDb = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { priceTiers: true },
    });

    const productMap = new Map(productsInDb.map((p) => [p.id, p]));

    let grandTotal = 0;
    const processedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `El repuesto con ID ${item.productId} no existe.`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `El producto "${product.name}" se encuentra inactivo y no puede ser vendido.`,
        );
      }

      const tierConfig = product.priceTiers.find(
        (t) => t.tier === item.priceTier,
      );
      if (!tierConfig) {
        throw new BadRequestException(
          `El producto "${product.name}" no tiene configurado el nivel de precio ${item.priceTier}.`,
        );
      }

      const officialUnitPrice = Number(tierConfig.price);
      const lineTotal = Number((officialUnitPrice * item.quantity).toFixed(2));
      grandTotal += lineTotal;

      return {
        ...item,
        internalCode: product.internalCode,
        productName: product.name,
        isTaxable: product.isTaxable ?? true,
        unitPrice: officialUnitPrice,
        costPrice: 0,
        subtotal: lineTotal,
      };
    });

    grandTotal = Number(grandTotal.toFixed(2));

    // 1. Validación de cuadre de caja global
    const totalPayments = dto.payments.reduce(
      (acc, p) => acc + Number(p.amount),
      0,
    );
    if (Math.abs(totalPayments - grandTotal) > 0.05) {
      throw new BadRequestException(
        `El pago ingresado (S/ ${totalPayments.toFixed(2)}) no coincide con el total de la venta (S/ ${grandTotal.toFixed(2)}).`,
      );
    }

    // 2. Validar cliente
    const customer = await this.salesRepo.findCustomerById(dto.customerId);
    if (!customer) {
      throw new NotFoundException('El cliente seleccionado no existe.');
    }

    const docNumber = customer.documentNumber?.trim() || '';
    const isComodin =
      !docNumber || docNumber === '00000000' || docNumber === '-';

    const wantsFiscal =
      dto.invoiceType === 'BOLETA' || dto.invoiceType === 'FACTURA';
    const taxableItems = processedItems.filter((i) => i.isTaxable);
    const nonTaxableItems = processedItems.filter((i) => !i.isTaxable);

    // Regla estricta del PM: Nunca facturar productos 🔴 Sin Factura
    if (wantsFiscal && taxableItems.length === 0) {
      throw new BadRequestException(
        'Ninguno de los repuestos en esta orden cuenta con sustento de factura (🔴 Sin Factura). Debe emitirla como Nota de Venta Interna.',
      );
    }

    // 3. Determinar si hay división automática (Split: 🟢 Fiscal + 🔴 Nota Interna)
    const requiresSplit =
      wantsFiscal && taxableItems.length > 0 && nonTaxableItems.length > 0;

    // Validar requisitos SUNAT sobre el monto que efectivamente irá a Boleta/Factura
    const fiscalTotal = Number(
      taxableItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2),
    );

    if (dto.invoiceType === 'FACTURA') {
      if (isComodin || docNumber.length !== 11) {
        throw new BadRequestException(
          'Para emitir Factura electrónica (F001) es obligatorio asignar un cliente con RUC válido de 11 dígitos.',
        );
      }
    }

    if (dto.invoiceType === 'BOLETA' && fiscalTotal >= 700) {
      if (isComodin || docNumber.length < 8) {
        throw new BadRequestException(
          `Por disposición de SUNAT, las Boletas por montos mayores o iguales a S/ 700.00 (monto facturable: S/ ${fiscalTotal.toFixed(2)}) requieren identificar al cliente con DNI o Carnet de Extranjería.`,
        );
      }
    }

    // CASO A: Venta Simple (100% Nota de Venta, o 100% Facturable)
    if (!requiresSplit) {
      return this.processSingleSale({
        items: processedItems,
        payments: dto.payments,
        invoiceType: dto.invoiceType,
        customer,
        sellerId,
        proformaId: dto.proformaId,
        notes: dto.notes,
      });
    }

    // CASO B: Venta Mixta (División automática en 2 comprobantes: Fiscal + Nota de Venta Interna)
    const internalTotal = Number((grandTotal - fiscalTotal).toFixed(2));
    const { fiscalPayments, internalPayments } = this.splitPaymentsByAmount(
      dto.payments,
      fiscalTotal,
      internalTotal,
    );

    const fiscalSale = await this.processSingleSale({
      items: taxableItems,
      payments: fiscalPayments,
      invoiceType: dto.invoiceType,
      customer,
      sellerId,
      proformaId: dto.proformaId,
      notes: [
        dto.notes,
        `[DESGLOSE FISCAL 🟢] Parte facturable de orden mixta (Total operación: S/ ${grandTotal.toFixed(2)})`,
      ]
        .filter(Boolean)
        .join(' | '),
    });

    const internalSale = await this.processSingleSale({
      items: nonTaxableItems,
      payments: internalPayments,
      invoiceType: 'NOTA_VENTA',
      customer,
      sellerId,
      proformaId: null, // Evita colisión con @unique de Sale.proformaId
      notes: [
        dto.notes,
        `[DESGLOSE INTERNO 🔴] Repuestos sin factura vinculados a ${fiscalSale.code}${proformaCodeRef ? ` (Proforma ${proformaCodeRef})` : ''}`,
      ]
        .filter(Boolean)
        .join(' | '),
    });

    return {
      ...fiscalSale,
      wasSplit: true,
      splitInternalSale: internalSale,
    };
  }

  private async processSingleSale(params: {
    items: any[];
    payments: CreateSaleDto['payments'];
    invoiceType: 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';
    customer: {
      id: string;
      documentNumber: string;
      name: string;
      address?: string | null;
      email?: string | null;
    };
    sellerId: string;
    proformaId?: string | null;
    notes?: string;
  }) {
    const total = Number(
      params.items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2),
    );
    const subtotal = Number((total / 1.18).toFixed(2));
    const igvAmount = Number((total - subtotal).toFixed(2));

    const totalCount = await this.salesRepo.countTotalSales();
    const code = `VNT-${new Date().getFullYear()}-${String(totalCount + 1).padStart(5, '0')}`;

    const isFiscal =
      params.invoiceType === 'BOLETA' || params.invoiceType === 'FACTURA';
    const series =
      params.invoiceType === 'FACTURA'
        ? 'F001'
        : params.invoiceType === 'BOLETA'
          ? 'B001'
          : 'NV01';
    const seriesCount = await this.salesRepo.countSalesBySeries(series);
    const correlative = seriesCount + 1;
    const fullCode = `${series}-${String(correlative).padStart(7, '0')}`;

    let invoiceStatus: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
    let externalId: string | null = null;
    let qrCodeUrl: string | null = null;
    let cdrHash: string | null = null;
    let errorMessage: string | null = null;

    // Transmitir a NubeFact si es Boleta o Factura electrónica
    if (isFiscal) {
      const nfResponse = await this.nubefactService.emitComprobante({
        invoiceType: params.invoiceType as 'BOLETA' | 'FACTURA',
        series,
        correlative,
        customer: {
          documentNumber: params.customer.documentNumber,
          name: params.customer.name,
          address: params.customer.address,
          email: params.customer.email,
        },
        subtotal,
        igvAmount,
        totalAmount: total,
        items: params.items.map((item) => ({
          code: item.internalCode,
          description: item.productName,
          quantity: item.quantity,
          unitPriceWithIgv: item.unitPrice,
          subtotalWithIgv: item.subtotal,
        })),
      });

      invoiceStatus = nfResponse.accepted ? 'ACCEPTED' : 'REJECTED';
      externalId = nfResponse.externalId;
      qrCodeUrl = nfResponse.qrCodeUrl;
      cdrHash = nfResponse.cdrHash;
      errorMessage = nfResponse.errorMessage || null;
    }

    const sale = await this.salesRepo.executeSaleTransaction({
      code,
      proformaId: params.proformaId,
      customerId: params.customer.id,
      sellerId: params.sellerId,
      subtotal,
      igvAmount,
      totalAmount: total,
      notes: params.notes,
      items: params.items,
      payments: params.payments,
      invoice: {
        type: params.invoiceType,
        series,
        correlative,
        fullCode,
        status: invoiceStatus,
        externalId,
        qrCodeUrl,
        cdrHash,
        errorMessage,
      },
    });

    if (params.proformaId) {
      await this.prisma.proforma.update({
        where: { id: params.proformaId },
        data: { status: ProformaStatus.CONVERTED },
      });
    }

    return sale;
  }

  private splitPaymentsByAmount(
    payments: CreateSaleDto['payments'],
    fiscalTarget: number,
    internalTarget: number,
  ) {
    let remainingFiscal = fiscalTarget;
    const fiscalPayments: CreateSaleDto['payments'] = [];
    const internalPayments: CreateSaleDto['payments'] = [];

    for (const pay of payments) {
      const amt = Number(pay.amount);
      if (remainingFiscal <= 0.009) {
        internalPayments.push({ ...pay, amount: Number(amt.toFixed(2)) });
      } else if (amt <= remainingFiscal + 0.009) {
        fiscalPayments.push({ ...pay, amount: Number(amt.toFixed(2)) });
        remainingFiscal = Number((remainingFiscal - amt).toFixed(2));
      } else {
        const forFiscal = Number(remainingFiscal.toFixed(2));
        const forInternal = Number((amt - remainingFiscal).toFixed(2));
        fiscalPayments.push({
          method: pay.method,
          amount: forFiscal,
          operationCode: pay.operationCode,
        });
        internalPayments.push({
          method: pay.method,
          amount: forInternal,
          operationCode: pay.operationCode,
        });
        remainingFiscal = 0;
      }
    }

    // Asegurar que la suma interna cuadre exacto si hubo redondeo
    const sumInternal = internalPayments.reduce((acc, p) => acc + p.amount, 0);
    if (
      internalPayments.length > 0 &&
      Math.abs(sumInternal - internalTarget) > 0.001
    ) {
      internalPayments[0].amount = Number(
        (internalPayments[0].amount + (internalTarget - sumInternal)).toFixed(
          2,
        ),
      );
    }

    return { fiscalPayments, internalPayments };
  }

  async getAllSales() {
    return this.salesRepo.findAllSales();
  }

  async getSaleById(id: string) {
    return this.salesRepo.findSaleById(id);
  }

  async cancelSale(saleId: string, userId: string, reason: string) {
    return this.salesRepo.cancelSale(saleId, userId, reason);
  }
}
