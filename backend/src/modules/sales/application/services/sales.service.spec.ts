// backend/src/modules/sales/application/services/sales.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SalesService } from './sales.service.js';
import { BadRequestException } from '@nestjs/common';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface.js';
import type { CreateSaleDto } from '../dtos/create-sale.dto.js';

describe('SalesService', () => {
    let service: SalesService;
    let repository: Partial<ISalesRepository>;
    let prisma: { proforma: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } };

    const baseItem = {
        productId: 'b1d03cb4-77bf-4f51-b8ea-b1981775f0a1',
        supplierId: 'c2d03cb4-77bf-4f51-b8ea-b1981775f0a2',
        quantity: 2,
        unitPrice: 50, // total: S/ 100.00
        priceTier: 1,
    };

    beforeEach(() => {
        repository = {
            findCustomerById: vi.fn(),
            countTotalSales: vi.fn(),
            countSalesBySeries: vi.fn(),
            executeSaleTransaction: vi.fn(),
            findAllSales: vi.fn(),
            findSaleById: vi.fn(),
            cancelSale: vi.fn(),
        };

        prisma = {
            proforma: {
                findUnique: vi.fn(),
                update: vi.fn(),
            },
        };

        service = new SalesService(repository as ISalesRepository, prisma as any);
    });

    it('debe lanzar BadRequestException si la venta no contiene ítems', async () => {
        const dto = {
            items: [],
            payments: [{ method: 'CASH', amount: 100 }],
        } as unknown as CreateSaleDto;

        await expect(service.createSale(dto, 'seller-uuid')).rejects.toThrow(
            BadRequestException,
        );
    });

    it('debe lanzar BadRequestException si el pago no cuadra con el monto total', async () => {
        const dto: CreateSaleDto = {
            customerId: 'cust-uuid',
            invoiceType: 'BOLETA',
            items: [baseItem], // Total = S/ 100.00
            payments: [{ method: 'CASH', amount: 80 }], // Descuadre (faltan S/ 20.00)
        };

        await expect(service.createSale(dto, 'seller-uuid')).rejects.toThrow(
            BadRequestException,
        );
    });

    it('debe exigir cliente con RUC válido de 11 dígitos al emitir FACTURA', async () => {
        vi.mocked(repository.findCustomerById!).mockResolvedValue({
            id: 'cust-uuid',
            documentNumber: '12345678', // Solo 8 dígitos (DNI)
        } as any);

        const dto: CreateSaleDto = {
            customerId: 'cust-uuid',
            invoiceType: 'FACTURA',
            items: [baseItem],
            payments: [{ method: 'CASH', amount: 100 }],
        };

        await expect(service.createSale(dto, 'seller-uuid')).rejects.toThrow(
            'Para emitir Factura electrónica (F001) es obligatorio asignar un cliente con RUC válido de 11 dígitos.',
        );
    });

    it('debe exigir identificación en BOLETA si el monto total es >= S/ 700.00 y el cliente es comodín', async () => {
        vi.mocked(repository.findCustomerById!).mockResolvedValue({
            id: 'cust-uuid',
            documentNumber: '00000000', // Cliente mostrador / comodín
        } as any);

        const expensiveItem = { ...baseItem, quantity: 1, unitPrice: 750 }; // Total = S/ 750.00

        const dto: CreateSaleDto = {
            customerId: 'cust-uuid',
            invoiceType: 'BOLETA',
            items: [expensiveItem],
            payments: [{ method: 'CASH', amount: 750 }],
        };

        await expect(service.createSale(dto, 'seller-uuid')).rejects.toThrow(
            /Por disposición de SUNAT, las Boletas por montos mayores o iguales a S\/ 700.00/,
        );
    });

    it('debe lanzar BadRequestException si la proforma está en PENDING_APPROVAL', async () => {
        prisma.proforma.findUnique.mockResolvedValue({
            id: 'prof-uuid',
            status: 'PENDING_APPROVAL',
            expiresAt: new Date(Date.now() + 100000),
        });

        const dto: CreateSaleDto = {
            proformaId: 'prof-uuid',
            customerId: 'cust-uuid',
            invoiceType: 'BOLETA',
            items: [baseItem],
            payments: [{ method: 'CASH', amount: 100 }],
        };

        await expect(service.createSale(dto, 'seller-uuid')).rejects.toThrow(
            'No se puede procesar la venta: la proforma está pendiente de aprobación gerencial.',
        );
    });

    it('debe calcular Subtotal, IGV (18%), generar la serie correspondiente y persistir la transacción', async () => {
        vi.mocked(repository.findCustomerById!).mockResolvedValue({
            id: 'cust-uuid',
            documentNumber: '71234567',
        } as any);
        vi.mocked(repository.countTotalSales!).mockResolvedValue(5);
        vi.mocked(repository.countSalesBySeries!).mockResolvedValue(10);
        vi.mocked(repository.executeSaleTransaction!).mockResolvedValue({
            id: 'sale-uuid',
            code: 'VNT-2026-00006',
        } as any);

        const dto: CreateSaleDto = {
            customerId: 'cust-uuid',
            invoiceType: 'BOLETA',
            items: [baseItem], // Total = S/ 100.00
            payments: [{ method: 'CASH', amount: 100 }],
        };

        await service.createSale(dto, 'seller-uuid');

        expect(repository.executeSaleTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                totalAmount: 100,
                subtotal: 84.75, // 100 / 1.18 = 84.745... -> redondeado a 84.75
                igvAmount: 15.25, // 100 - 84.75 = 15.25
                invoice: expect.objectContaining({
                    type: 'BOLETA',
                    series: 'B001',
                    correlative: 11,
                    fullCode: 'B001-0000011',
                }),
            }),
        );
    });
});