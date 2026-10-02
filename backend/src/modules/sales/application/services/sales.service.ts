// backend/src/modules/sales/application/services/sales.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface.js';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface.js';
import type { CreateSaleDto } from '../dtos/create-sale.dto.js';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { ProformaStatus } from '@prisma/client';

@Injectable()
export class SalesService {
    constructor(
        @Inject(SALES_REPOSITORY)
        private readonly salesRepo: ISalesRepository,
        private readonly prisma: PrismaService,
    ) { }

    async createSale(dto: CreateSaleDto, sellerId: string) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Debe incluir al menos un ítem.');
        }

        if (!dto.payments || dto.payments.length === 0) {
            throw new BadRequestException('Debe registrar al menos un método de pago.');
        }

        // VALIDACIÓN H02: Venta directa con Tier 3 prohibida sin proforma aprobada
        const hasTier3 = dto.items.some((i) => i.priceTier === 3);
        if (hasTier3 && !dto.proformaId) {
            throw new BadRequestException(
                'Las ventas con Precio 3 (mayorista) requieren obligatoriamente de una proforma aprobada por gerencia.',
            );
        }

        // VALIDACIÓN H02: Validar proforma vinculada
        if (dto.proformaId) {
            const proforma = await this.prisma.proforma.findUnique({
                where: { id: dto.proformaId },
            });

            if (!proforma) {
                throw new NotFoundException('La proforma referenciada no existe.');
            }

            if (proforma.status === ProformaStatus.PENDING_APPROVAL) {
                throw new BadRequestException(
                    'No se puede procesar la venta: la proforma está pendiente de aprobación gerencial.',
                );
            }

            if (proforma.status === ProformaStatus.REJECTED) {
                throw new BadRequestException('No se puede procesar la venta: la proforma ha sido rechazada.');
            }

            if (proforma.status === ProformaStatus.CONVERTED) {
                throw new BadRequestException('Esta proforma ya fue convertida a venta previamente.');
            }

            if (proforma.expiresAt && new Date(proforma.expiresAt) < new Date()) {
                throw new BadRequestException('La proforma ha caducado (vigencia máxima de 48 horas superada).');
            }
        }

        // PROTECCIÓN H01: Obtener precios oficiales del catálogo y recalcular
        const productIds = dto.items.map((i) => i.productId);
        const productsInDb = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { priceTiers: true },
        });

        const productMap = new Map(productsInDb.map((p) => [p.id, p]));

        let total = 0;
        const processedItems = dto.items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
                throw new BadRequestException(`El repuesto con ID ${item.productId} no existe.`);
            }

            const tierConfig = product.priceTiers.find((t) => t.tier === item.priceTier);
            if (!tierConfig) {
                throw new BadRequestException(
                    `El producto "${product.name}" no tiene configurado el nivel de precio ${item.priceTier}.`,
                );
            }

            const officialUnitPrice = Number(tierConfig.price);
            const lineTotal = Number((officialUnitPrice * item.quantity).toFixed(2));
            total += lineTotal;

            return {
                ...item,
                unitPrice: officialUnitPrice,
                costPrice: 0,
                subtotal: lineTotal,
            };
        });

        // 1. Validación de cuadre de caja
        const totalPayments = dto.payments.reduce((acc, p) => acc + Number(p.amount), 0);
        if (Math.abs(totalPayments - total) > 0.05) {
            throw new BadRequestException(
                `El pago ingresado (S/ ${totalPayments.toFixed(2)}) no coincide con el total de la venta (S/ ${total.toFixed(2)}).`
            );
        }

        // 2. Validación Normativa SUNAT (S/ 700.00 & RUC obligatorio)
        const customer = await this.salesRepo.findCustomerById?.(dto.customerId);
        const docNumber = customer?.documentNumber?.trim() || '';
        const isComodin = !docNumber || docNumber === '00000000' || docNumber === '-';

        if (dto.invoiceType === 'FACTURA') {
            if (isComodin || docNumber.length !== 11) {
                throw new BadRequestException(
                    'Para emitir Factura electrónica (F001) es obligatorio asignar un cliente con RUC válido de 11 dígitos.'
                );
            }
        }

        if (dto.invoiceType === 'BOLETA' && total >= 700) {
            if (isComodin || docNumber.length < 8) {
                throw new BadRequestException(
                    `Por disposición de SUNAT, las Boletas por montos mayores o iguales a S/ 700.00 requieren identificar al cliente con DNI o Carnet de Extranjería.`
                );
            }
        }

        total = Number(total.toFixed(2));
        const subtotal = Number((total / 1.18).toFixed(2));
        const igvAmount = Number((total - subtotal).toFixed(2));

        const totalCount = await this.salesRepo.countTotalSales();
        const code = `VNT-${new Date().getFullYear()}-${String(totalCount + 1).padStart(5, '0')}`;

        // Generar correlativo según tipo
        const isFiscal = dto.invoiceType === 'BOLETA' || dto.invoiceType === 'FACTURA';
        const series = dto.invoiceType === 'FACTURA' ? 'F001' : dto.invoiceType === 'BOLETA' ? 'B001' : 'NV01';
        const seriesCount = await this.salesRepo.countSalesBySeries(series);
        const correlative = seriesCount + 1;
        const fullCode = `${series}-${String(correlative).padStart(7, '0')}`;

        // Estado y Firma según si es fiscal o interno
        const invoiceStatus = isFiscal ? 'ACCEPTED' : 'INTERNAL';
        const hashCpe = isFiscal ? `HASH-${Date.now()}` : null;

        const result = await this.salesRepo.executeSaleTransaction({
            code,
            proformaId: dto.proformaId,
            customerId: dto.customerId,
            sellerId,
            subtotal,
            igvAmount,
            totalAmount: total,
            notes: dto.notes,
            items: processedItems,
            payments: dto.payments,
            invoice: {
                type: dto.invoiceType,
                series,
                correlative,
                fullCode,
                status: invoiceStatus,
                hashCpe,
            },
        });

        // Actualizar estado de la proforma a CONVERTED
        if (dto.proformaId) {
            await this.prisma.proforma.update({
                where: { id: dto.proformaId },
                data: { status: ProformaStatus.CONVERTED },
            });
        }

        return result;
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