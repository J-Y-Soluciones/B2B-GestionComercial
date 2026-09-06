import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface.js';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface.js';
import type { CreateSaleDto } from '../dtos/create-sale.dto.js';

@Injectable()
export class SalesService {
    constructor(
        @Inject(SALES_REPOSITORY)
        private readonly salesRepo: ISalesRepository,
    ) { }

    async createSale(dto: CreateSaleDto, sellerId: string) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Debe incluir al menos un ítem.');
        }

        if (!dto.payments || dto.payments.length === 0) {
            throw new BadRequestException('Debe registrar al menos un método de pago.');
        }

        let total = 0;
        const processedItems = dto.items.map((item) => {
            const lineTotal = Number(item.unitPrice) * item.quantity;
            total += lineTotal;
            return {
                ...item,
                costPrice: 0,
                subtotal: lineTotal,
            };
        });

        const subtotal = Number((total / 1.18).toFixed(2));
        const igvAmount = Number((total - subtotal).toFixed(2));

        const totalPayments = dto.payments.reduce((acc, p) => acc + Number(p.amount), 0);
        if (Math.abs(totalPayments - total) > 0.05) {
            throw new BadRequestException(
                `El pago ingresado (S/ ${totalPayments.toFixed(2)}) no coincide con el total de la venta (S/ ${total.toFixed(2)}).`
            );
        }

        const totalCount = await this.salesRepo.countTotalSales();
        const code = `VNT-${new Date().getFullYear()}-${String(totalCount + 1).padStart(5, '0')}`;

        const series = dto.invoiceType === 'FACTURA' ? 'F001' : dto.invoiceType === 'BOLETA' ? 'B001' : 'NV01';
        const seriesCount = await this.salesRepo.countSalesBySeries(series);
        const correlative = seriesCount + 1;
        const fullCode = `${series}-${String(correlative).padStart(7, '0')}`;

        return this.salesRepo.executeSaleTransaction({
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
            },
        });
    }

    async getAllSales() {
        return this.salesRepo.findAllSales();
    }

    async getSaleById(id: string) {
        return this.salesRepo.findSaleById(id);
    }
}