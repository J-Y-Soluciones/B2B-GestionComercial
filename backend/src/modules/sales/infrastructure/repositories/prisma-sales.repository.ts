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
        return this.prisma.$transaction(async (tx) => {
            // 1. Validar y descontar stock por proveedor
            for (const item of data.items) {
                const stockRecord = await tx.supplierProductStock.findUnique({
                    where: {
                        productId_supplierId: {
                            productId: item.productId,
                            supplierId: item.supplierId,
                        },
                    },
                    include: { product: true },
                });

                if (!stockRecord) {
                    throw new BadRequestException('Sin existencias configuradas para el proveedor seleccionado.');
                }

                if (stockRecord.stock < item.quantity) {
                    throw new BadRequestException(
                        `Stock insuficiente para "${stockRecord.product.name}". Disponible: ${stockRecord.stock}, Solicitado: ${item.quantity}`
                    );
                }

                await tx.supplierProductStock.update({
                    where: { id: stockRecord.id },
                    data: { stock: { decrement: item.quantity } },
                });

                item.costPrice = Number(stockRecord.costPrice);
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

            // 3. Crear factura/boleta
            await tx.invoice.create({
                data: {
                    saleId: sale.id,
                    type: data.invoice.type,
                    series: data.invoice.series,
                    correlative: data.invoice.correlative,
                    fullCode: data.invoice.fullCode,
                    status: 'ACCEPTED',
                    cdrHash: `HASH-${Date.now()}`,
                    externalId: `EFACT-MOCK-${Date.now()}`,
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

            return tx.sale.findUnique({
                where: { id: sale.id },
                include: {
                    customer: true,
                    details: { include: { product: true, supplier: true } },
                    payments: true,
                    invoice: true,
                },
            });
        });
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
}