import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { ISalesRepository, CreateSaleData } from '../../domain/repositories/sales.repository.interface.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaSalesRepository implements ISalesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async countTotalSales(): Promise<number> {
        return this.prisma.sale.count();
    }

    async countSalesBySeries(series: string): Promise<number> {
        return this.prisma.invoice.count({ where: { series } });
    }

    async executeSaleTransaction(data: CreateSaleData): Promise<any> {
        return this.prisma.$transaction(
            async (tx) => {
                // 1. Validar y descontar stock por proveedor
                for (const item of data.items) {
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.supplierId);

                    let stockRecord = null;

                    // 1.1 Intentar con el proveedor explícito si tiene stock suficiente
                    if (isUUID) {
                        const candidate = await tx.supplierProductStock.findUnique({
                            where: {
                                productId_supplierId: {
                                    productId: item.productId,
                                    supplierId: item.supplierId,
                                },
                            },
                            include: { product: true },
                        });

                        if (candidate && candidate.stock >= item.quantity) {
                            stockRecord = candidate;
                        }
                    }

                    // 1.2 Fallback: si no vino UUID o el proveedor asignado no tiene stock suficiente,
                    // buscar el primer proveedor que sí cubra la cantidad requerida
                    if (!stockRecord) {
                        stockRecord = await tx.supplierProductStock.findFirst({
                            where: {
                                productId: item.productId,
                                stock: { gte: item.quantity },
                            },
                            include: { product: true },
                            orderBy: { stock: 'desc' },
                        });
                    }

                    // 1.3 Si ningún proveedor individual cubre la cantidad, abortar para evitar stock negativo
                    if (!stockRecord) {
                        const anyStock = await tx.supplierProductStock.findFirst({
                            where: { productId: item.productId },
                            include: { product: true },
                            orderBy: { stock: 'desc' },
                        });

                        if (!anyStock) {
                            throw new BadRequestException('El repuesto no tiene existencias ni proveedores registrados en Kardex.');
                        }

                        throw new BadRequestException(
                            `Stock insuficiente para "${anyStock.product.name}". Disponible en mayor lote: ${anyStock.stock} u., Solicitado: ${item.quantity} u.`
                        );
                    }

                    // Asignar el supplierId real con existencias confirmadas
                    item.supplierId = stockRecord.supplierId;
                    item.costPrice = Number(stockRecord.costPrice);

                    // Descontar inventario de forma segura
                    await tx.supplierProductStock.update({
                        where: { id: stockRecord.id },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                // 2. Crear registro de venta
                const sale = await tx.sale.create({
                    data: {
                        code: data.code,
                        proformaId: data.proformaId || null,
                        customerId: data.customerId,
                        sellerId: data.sellerId,
                        subtotal: new Prisma.Decimal(data.subtotal),
                        igvAmount: new Prisma.Decimal(data.igvAmount),
                        totalAmount: new Prisma.Decimal(data.totalAmount),
                        notes: data.notes,
                        details: {
                            create: data.items.map((i) => ({
                                productId: i.productId,
                                supplierId: i.supplierId,
                                quantity: i.quantity,
                                unitPrice: new Prisma.Decimal(i.unitPrice),
                                priceTier: i.priceTier,
                                costPrice: new Prisma.Decimal(i.costPrice),
                                subtotal: new Prisma.Decimal(i.subtotal),
                            })),
                        },
                        payments: {
                            create: data.payments.map((p) => ({
                                method: p.method,
                                amount: new Prisma.Decimal(p.amount),
                                receivedAmount: p.receivedAmount ? new Prisma.Decimal(p.receivedAmount) : null,
                                changeAmount: p.changeAmount ? new Prisma.Decimal(p.changeAmount) : null,
                                operationCode: p.operationCode,
                            })),
                        },
                    },
                });

                // 3. Crear comprobante (Factura / Boleta / Nota de Venta)
                const isFiscal = data.invoice.type === 'BOLETA' || data.invoice.type === 'FACTURA';

                const invoiceStatus = (data.invoice.status === 'INTERNAL' ? 'ACCEPTED' : (data.invoice.status || 'ACCEPTED')) as any;
                const invoiceCdrHash = isFiscal ? `CDR-${Date.now()}` : null;
                const invoiceExternalId = isFiscal ? `EFACT-${Date.now()}` : null;

                await tx.invoice.create({
                    data: {
                        saleId: sale.id,
                        type: data.invoice.type,
                        series: data.invoice.series,
                        correlative: data.invoice.correlative,
                        fullCode: data.invoice.fullCode,
                        status: invoiceStatus,
                        cdrHash: invoiceCdrHash,
                        externalId: invoiceExternalId,
                    },
                });

                // 4. Si proviene de proforma, actualizar estado
                if (data.proformaId) {
                    await tx.proforma.update({
                        where: { id: data.proformaId },
                        data: { status: 'CONVERTED' },
                    });

                    await tx.proformaStatusLog.create({
                        data: {
                            proformaId: data.proformaId,
                            status: 'CONVERTED',
                            changedById: data.sellerId,
                            reason: `Convertida a venta exitosa con código ${data.code} y comprobante ${data.invoice.fullCode}.`,
                        },
                    });
                }

                return await tx.sale.findUnique({
                    where: { id: sale.id },
                    include: {
                        customer: true,
                        details: { include: { product: true, supplier: true } },
                        payments: true,
                        invoice: true,
                    },
                });
            },
            {
                maxWait: 10000, // 10 segundos esperando turno en el pool
                timeout: 20000, // 20 segundos para completar la transacción completa
            }
        );
    }

    async findSaleById(id: string): Promise<any> {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                seller: { select: { email: true } },
                details: { include: { product: true, supplier: true } },
                payments: true,
                invoice: true,
            },
        });
        if (!sale) throw new NotFoundException('Venta no encontrada.');
        return sale;
    }

    async findAllSales(): Promise<any[]> {
        return this.prisma.sale.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                seller: { select: { email: true } },
                details: { include: { product: true } },
                payments: true,
                invoice: true,
            },
        });
    }

    async cancelSale(saleId: string, cancelledById: string, reason: string): Promise<any> {
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { details: true, invoice: true },
            });

            if (!sale) throw new NotFoundException('Venta no encontrada.');

            if (sale.notes?.includes('[ANULADA]')) {
                throw new BadRequestException('Esta venta ya se encuentra anulada.');
            }

            // 1. Reintegrar stock al inventario por proveedor
            for (const item of sale.details) {
                if (item.supplierId) {
                    await tx.supplierProductStock.updateMany({
                        where: {
                            productId: item.productId,
                            supplierId: item.supplierId,
                        },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }

            // 2. Anular comprobante
            if (sale.invoice) {
                await tx.invoice.update({
                    where: { id: sale.invoice.id },
                    data: { status: 'ANULLED' as any },
                });
            }

            // 3. Auditoría en notas
            const auditNote = `[ANULADA] Motivo: ${reason} | Autorizado por: ${cancelledById} (${new Date().toISOString()})`;
            const updatedNotes = sale.notes ? `${sale.notes} | ${auditNote}` : auditNote;

            return tx.sale.update({
                where: { id: saleId },
                data: { notes: updatedNotes },
                include: {
                    customer: true,
                    invoice: true,
                    payments: true,
                    details: { include: { product: true } },
                },
            });
        });
    }

    async findCustomerById(id: string) {
        return this.prisma.customer.findUnique({
            where: { id },
            select: { id: true, documentNumber: true, name: true },
        });
    }
}