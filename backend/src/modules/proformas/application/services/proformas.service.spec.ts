// backend/src/modules/proformas/application/services/proformas.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProformaService } from './proformas.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { IProformaRepository, ProformaWithDetails } from '../../domain/repositories/proforma.repository.interface.js';
import { ProformaStatus, CustomerType } from '@prisma/client';
import { ProformaPdfService } from './proforma-pdf.service.js';
import { Decimal } from '@prisma/client/runtime/library';
import type { PrismaService } from '../../../../core/prisma/prisma.service.js';

describe('ProformaService', () => {
    let service: ProformaService;
    let repository: Partial<IProformaRepository>;
    let pdfService: Partial<ProformaPdfService>;
    let prisma: { product: { findMany: ReturnType<typeof vi.fn> } };

    const now = new Date();

    const mockProformaPendingApproval: ProformaWithDetails = {
        id: '7b544327-0cf1-450f-a3e9-a787201fa381',
        code: 'PROF-2026-0001',
        customerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        sellerId: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        totalAmount: new Decimal(150.0),
        status: ProformaStatus.PENDING_APPROVAL,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
        createdAt: now,
        updatedAt: now,
        customer: {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            type: CustomerType.BUSINESS,
            documentNumber: '10444555661',
            name: 'Cliente Prueba',
            email: 'prueba@cliente.pe',
            phone: '999111222',
            address: 'Calle Lima 123',
            createdAt: now,
            updatedAt: now,
        },
        seller: {
            id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            email: 'vendedor@empresa.com',
        },
        details: [
            {
                id: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
                proformaId: '7b544327-0cf1-450f-a3e9-a787201fa381',
                productId: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                supplierId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
                quantity: 2,
                unitPrice: new Decimal(75.0),
                priceTier: 3,
                subtotal: new Decimal(150.0),
                product: {
                    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                    internalCode: 'DSC-001',
                    name: 'Disco de Freno',
                    category: 'Frenos',
                    brand: 'Bosch',
                    imageUrl: null, // Soluciona error TS2741
                    minStock: 5,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                },
            },
        ],
    };

    beforeEach(() => {
        repository = {
            getNextSequenceCode: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
            changeStatus: vi.fn(),
        };
        pdfService = {
            generate: vi.fn(),
        };
        prisma = {
            product: {
                findMany: vi.fn(),
            },
        };

        service = new ProformaService(
            repository as IProformaRepository,
            pdfService as ProformaPdfService,
            prisma as unknown as PrismaService, // Soluciona error TS2554
        );
    });

    describe('create', () => {
        it('debe asignar PENDING_APPROVAL cuando al menos un item usa priceTier = 3', async () => {
            vi.mocked(repository.getNextSequenceCode!).mockResolvedValue('PROF-2026-0001');
            vi.mocked(repository.create!).mockResolvedValue(mockProformaPendingApproval);

            // Mock de los productos en base de datos con sus priceTiers oficiales
            prisma.product.findMany.mockResolvedValue([
                {
                    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                    name: 'Disco de Freno',
                    isActive: true,
                    priceTiers: [
                        { tier: 1, price: new Decimal(100.0) },
                        { tier: 2, price: new Decimal(90.0) },
                        { tier: 3, price: new Decimal(75.0) },
                    ],
                },
            ]);

            const dto = {
                customerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                items: [
                    {
                        productId: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                        quantity: 2,
                        unitPrice: 0, // Probamos que ignore 0 y use el autorizado
                        priceTier: 3,
                    },
                ],
            };

            const result = await service.create('seller-uuid', dto);

            expect(result.status).toBe(ProformaStatus.PENDING_APPROVAL);
            expect(repository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'PROF-2026-0001',
                    status: ProformaStatus.PENDING_APPROVAL,
                    totalAmount: 150.0,
                }),
            );
        });

        it('debe asignar PENDING normal cuando ningun item usa priceTier = 3', async () => {
            vi.mocked(repository.getNextSequenceCode!).mockResolvedValue('PROF-2026-0002');
            vi.mocked(repository.create!).mockResolvedValue({
                ...mockProformaPendingApproval,
                status: ProformaStatus.PENDING,
            });

            prisma.product.findMany.mockResolvedValue([
                {
                    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                    name: 'Disco de Freno',
                    isActive: true,
                    priceTiers: [
                        { tier: 1, price: new Decimal(100.0) },
                        { tier: 2, price: new Decimal(90.0) },
                        { tier: 3, price: new Decimal(75.0) },
                    ],
                },
            ]);

            const dto = {
                customerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                items: [
                    {
                        productId: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                        quantity: 1,
                        unitPrice: 100.0,
                        priceTier: 1,
                    },
                ],
            };

            const result = await service.create('seller-uuid', dto);

            expect(result.status).toBe(ProformaStatus.PENDING);
            expect(repository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: ProformaStatus.PENDING,
                    totalAmount: 100.0,
                }),
            );
        });
    });

    describe('approve', () => {
        it('debe cambiar de PENDING_APPROVAL a APPROVED exitosamente', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockProformaPendingApproval);
            vi.mocked(repository.changeStatus!).mockResolvedValue({
                ...mockProformaPendingApproval,
                status: ProformaStatus.APPROVED,
            });

            const result = await service.approve(mockProformaPendingApproval.id, 'manager-uuid');

            expect(result.status).toBe(ProformaStatus.APPROVED);
            expect(repository.changeStatus).toHaveBeenCalledWith(mockProformaPendingApproval.id, {
                status: ProformaStatus.APPROVED,
                changedById: 'manager-uuid',
                reason: 'Aprobación gerencial de Precio 3',
            });
        });

        it('debe lanzar BadRequestException si la proforma no se encuentra en PENDING_APPROVAL', async () => {
            vi.mocked(repository.findById!).mockResolvedValue({
                ...mockProformaPendingApproval,
                status: ProformaStatus.PENDING,
            });

            await expect(
                service.approve(mockProformaPendingApproval.id, 'manager-uuid'),
            ).rejects.toThrow(BadRequestException);
        });

        it('debe lanzar NotFoundException si la proforma no existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(null);

            await expect(
                service.approve('non-existent-id', 'manager-uuid'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('reject', () => {
        it('debe cambiar de PENDING_APPROVAL a REJECTED registrando la razon', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockProformaPendingApproval);
            vi.mocked(repository.changeStatus!).mockResolvedValue({
                ...mockProformaPendingApproval,
                status: ProformaStatus.REJECTED,
            });

            const result = await service.reject(
                mockProformaPendingApproval.id,
                'manager-uuid',
                'Margen insuficiente',
            );

            expect(result.status).toBe(ProformaStatus.REJECTED);
            expect(repository.changeStatus).toHaveBeenCalledWith(mockProformaPendingApproval.id, {
                status: ProformaStatus.REJECTED,
                changedById: 'manager-uuid',
                reason: 'Margen insuficiente',
            });
        });

        it('debe lanzar BadRequestException si la proforma a rechazar no esta en PENDING_APPROVAL', async () => {
            vi.mocked(repository.findById!).mockResolvedValue({
                ...mockProformaPendingApproval,
                status: ProformaStatus.APPROVED,
            });

            await expect(
                service.reject(mockProformaPendingApproval.id, 'manager-uuid', 'Rechazar tarde'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('generatePdf', () => {
        it('debe generar el buffer y el nombre del archivo PDF a partir del codigo', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockProformaPendingApproval);
            const fakeBuffer = Buffer.from('fake-pdf-content');
            vi.mocked(pdfService.generate!).mockResolvedValue(fakeBuffer);

            const result = await service.generatePdf(mockProformaPendingApproval.id);

            expect(result.fileName).toBe('PROF-2026-0001.pdf');
            expect(result.buffer).toBe(fakeBuffer);
            expect(pdfService.generate).toHaveBeenCalledTimes(1);
        });
    });
});