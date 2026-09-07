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

    private readonly defaultIncludes = {
        customer: true,
        seller: {
            select: { id: true, email: true, role: true },
        },
        details: {
            include: {
                product: {
                    include: {
                        stocks: {
                            include: { supplier: true }
                        }
                    }
                }
            }
        },
        statusLogs: {
            include: {
                changedBy: {
                    select: { email: true },
                },
            },
            orderBy: { createdAt: 'desc' as const },
        },
    };

    async findById(id: string): Promise<ProformaWithDetails | null> {
        const result = await this.prisma.proforma.findUnique({
            where: { id },
            include: this.defaultIncludes,
        });
        return result as unknown as ProformaWithDetails | null;
    }

    async findAll(filters: SearchProformaFilters): Promise<ProformaWithDetails[]> {
        const where: Prisma.ProformaWhereInput = {
            ...(filters.customerId && { customerId: filters.customerId }),
            ...(filters.sellerId && { sellerId: filters.sellerId }),
            ...(filters.status && { status: filters.status }),
        };

        const results = await this.prisma.proforma.findMany({
            where,
            include: this.defaultIncludes,
            orderBy: { createdAt: 'desc' },
        });

        return results as unknown as ProformaWithDetails[];
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
                            supplierId: d.supplierId,
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
                include: this.defaultIncludes,
            });
            return proforma as unknown as ProformaWithDetails;
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
                include: this.defaultIncludes,
            });
            return proforma as unknown as ProformaWithDetails;
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