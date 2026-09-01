import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { CreateProformaDto } from '../dtos/create-proforma.dto.js';
import { QueryProformaDto } from '../dtos/query-proforma.dto.js';
import { ProformaStatus, Prisma } from '@prisma/client';

@Injectable()
export class ProformasService {
    private readonly PROFORMA_TTL_HOURS = 48;

    constructor(private readonly prisma: PrismaService) { }

    async createProforma(sellerId: string, dto: CreateProformaDto) {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
            if (!customer) throw new NotFoundException('Cliente no encontrado');

            let totalAmount = new Prisma.Decimal(0);
            let requiresManagerApproval = false;
            const processedDetails = [];

            for (const detail of dto.details) {
                const priceTierRecord = await tx.priceTier.findUnique({
                    where: {
                        productId_tier: { productId: detail.productId, tier: detail.priceTier },
                    },
                });

                if (!priceTierRecord) {
                    throw new BadRequestException(
                        `Precio nivel ${detail.priceTier} no configurado para el producto ${detail.productId}`,
                    );
                }

                const unitPrice = priceTierRecord.price;
                const subtotal = unitPrice.mul(detail.quantity);
                totalAmount = totalAmount.add(subtotal);

                if (detail.priceTier === 3) {
                    requiresManagerApproval = true;
                }

                processedDetails.push({
                    productId: detail.productId,
                    quantity: detail.quantity,
                    unitPrice,
                    priceTier: detail.priceTier,
                    subtotal,
                });
            }

            const initialStatus = requiresManagerApproval
                ? ProformaStatus.PENDING_APPROVAL
                : ProformaStatus.PENDING;

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + this.PROFORMA_TTL_HOURS);

            const code = `PROF-${Date.now().toString().slice(-6)}`;

            const proforma = await tx.proforma.create({
                data: {
                    code,
                    customerId: dto.customerId,
                    sellerId,
                    totalAmount,
                    status: initialStatus,
                    expiresAt,
                    details: {
                        create: processedDetails,
                    },
                    statusLogs: {
                        create: {
                            status: initialStatus,
                            changedById: sellerId,
                            reason: 'Creación inicial de proforma',
                        },
                    },
                },
                include: { details: true },
            });

            return proforma;
        });
    }

    async approveProforma(id: string, managerId: string) {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const proforma = await tx.proforma.findUnique({ where: { id } });
            if (!proforma) throw new NotFoundException('Proforma no encontrada');
            if (proforma.status !== ProformaStatus.PENDING_APPROVAL) {
                throw new BadRequestException('La proforma no está pendiente de aprobación');
            }

            return tx.proforma.update({
                where: { id },
                data: {
                    status: ProformaStatus.APPROVED,
                    statusLogs: {
                        create: {
                            status: ProformaStatus.APPROVED,
                            changedById: managerId,
                            reason: 'Aprobación gerencial de Precio 3',
                        },
                    },
                },
            });
        });
    }

    async rejectProforma(id: string, managerId: string, reason: string) {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const proforma = await tx.proforma.findUnique({ where: { id } });
            if (!proforma) throw new NotFoundException('Proforma no encontrada');
            if (proforma.status !== ProformaStatus.PENDING_APPROVAL) {
                throw new BadRequestException('La proforma no está pendiente de aprobación');
            }

            return tx.proforma.update({
                where: { id },
                data: {
                    status: ProformaStatus.REJECTED,
                    statusLogs: {
                        create: {
                            status: ProformaStatus.REJECTED,
                            changedById: managerId,
                            reason,
                        },
                    },
                },
            });
        });
    }

    async findAll(query: QueryProformaDto) {
        const { page = 1, limit = 10, status, customerId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ProformaWhereInput = {
            ...(status && { status }),
            ...(customerId && { customerId }),
        };

        const [data, total] = await Promise.all([
            this.prisma.proforma.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { customer: true, seller: { select: { email: true } } },
            }),
            this.prisma.proforma.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}