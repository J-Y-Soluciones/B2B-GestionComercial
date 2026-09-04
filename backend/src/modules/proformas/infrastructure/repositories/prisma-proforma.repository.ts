// backend/src/modules/proformas/infrastructure/repositories/prisma-proforma.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type {
    IProformaRepository,
    ProformaWithDetails,
    CreateProformaData,
    ChangeStatusData,
    SearchProformaFilters,
} from '../../domain/repositories/proforma.repository.interface.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaProformaRepository implements IProformaRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<any | null> {
        return this.prisma.proforma.findUnique({
            where: { id },
            include: {
                customer: true,
                seller: {
                    select: { id: true, email: true },
                },
                details: {
                    include: {
                        product: true,
                    },
                },
                statusLogs: { orderBy: { createdAt: 'desc' } },
            },
        });
    }

    async findAll(filters: SearchProformaFilters): Promise<ProformaWithDetails[]> {
        const where: Prisma.ProformaWhereInput = {
            ...(filters.customerId && { customerId: filters.customerId }),
            ...(filters.sellerId && { sellerId: filters.sellerId }),
            ...(filters.status && { status: filters.status }),
        };

        return this.prisma.proforma.findMany({
            where,
            include: {
                details: true,
                statusLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: CreateProformaData): Promise<ProformaWithDetails> {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const proforma = await tx.proforma.create({
                data: {
                    code: data.code,
                    customerId: data.customerId,
                    sellerId: data.sellerId,
                    totalAmount: data.totalAmount,
                    status: data.status,
                    expiresAt: data.expiresAt,
                    details: {
                        create: data.details.map((d) => ({
                            productId: d.productId,
                            quantity: d.quantity,
                            unitPrice: d.unitPrice,
                            priceTier: d.priceTier,
                            subtotal: d.subtotal,
                        })),
                    },
                    statusLogs: {
                        create: {
                            status: data.status,
                            changedById: data.sellerId,
                            reason: 'Creación inicial de proforma',
                        },
                    },
                },
                include: {
                    details: true,
                    statusLogs: true,
                },
            });
            return proforma;
        });
    }

    async changeStatus(id: string, data: ChangeStatusData): Promise<ProformaWithDetails> {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const proforma = await tx.proforma.update({
                where: { id },
                data: {
                    status: data.status,
                    statusLogs: {
                        create: {
                            status: data.status,
                            changedById: data.changedById,
                            reason: data.reason,
                        },
                    },
                },
                include: {
                    details: true,
                    statusLogs: { orderBy: { createdAt: 'desc' } },
                },
            });
            return proforma;
        });
    }

    async getNextSequenceCode(): Promise<string> {
        const currentYear = new Date().getFullYear();
        const prefix = `PROF-${currentYear}-`;

        const count = await this.prisma.proforma.count({
            where: { code: { startsWith: prefix } },
        });

        return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
    }
}