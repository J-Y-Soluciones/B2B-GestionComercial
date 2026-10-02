// backend/src/modules/proformas/application/services/proformas.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IProformaRepository, ProformaWithDetails, SearchProformaFilters } from '../../domain/repositories/proforma.repository.interface.js';
import { PROFORMA_REPOSITORY } from '../../domain/repositories/proforma.repository.interface.js';
import { CreateProformaDto } from '../dtos/create-proforma.dto.js';
import { ProformaStatus } from '@prisma/client';
import { ProformaPdfService } from './proforma-pdf.service.js';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';

@Injectable()
export class ProformaService {
    private readonly TTL_HOURS = 48;

    constructor(
        @Inject(PROFORMA_REPOSITORY)
        private readonly proformaRepository: IProformaRepository,
        private readonly proformaPdfService: ProformaPdfService,
        private readonly prisma: PrismaService,
    ) { }

    async create(sellerId: string, dto: CreateProformaDto): Promise<ProformaWithDetails> {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('La proforma debe incluir al menos un producto.');
        }

        // 1. Obtener IDs únicos de productos
        const productIds = [...new Set(dto.items.map((item) => item.productId))];

        // 2. Traer productos junto con sus priceTiers desde la base de datos
        const dbProducts = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                priceTiers: true,
            },
        });

        const productMap = new Map(dbProducts.map((p) => [p.id, p]));

        let totalAmount = 0;
        let requiresApproval = false;

        // 3. Validar productos, extraer el precio oficial y recalcular importes
        const details = dto.items.map((item) => {
            const product = productMap.get(item.productId);

            if (!product) {
                throw new NotFoundException(`El producto con ID ${item.productId} no existe.`);
            }

            if (!product.isActive) {
                throw new BadRequestException(`El producto "${product.name}" está inactivo.`);
            }

            // Buscar en priceTiers el registro que coincide con item.priceTier (ej: tier 1, 2 o 3)
            const matchedTier = product.priceTiers.find((pt: any) => pt.tier === item.priceTier);

            if (!matchedTier) {
                throw new BadRequestException(
                    `El producto "${product.name}" no tiene configurado el nivel de precio Tier ${item.priceTier}.`
                );
            }

            // El precio oficial proviene exclusivamente de la base de datos
            const authorizedPrice = Number(matchedTier.price);

            if (item.priceTier === 3) {
                requiresApproval = true;
            }

            // Recalcular subtotal y acumular el total en el servidor
            const subtotal = Number((item.quantity * authorizedPrice).toFixed(2));
            totalAmount = Number((totalAmount + subtotal).toFixed(2));

            return {
                productId: item.productId,
                supplierId: item.supplierId,
                quantity: item.quantity,
                unitPrice: authorizedPrice, // Ignora el unitPrice enviado por el cliente
                priceTier: item.priceTier,
                subtotal,
            };
        });

        const status = requiresApproval ? ProformaStatus.PENDING_APPROVAL : ProformaStatus.PENDING;
        const code = await this.proformaRepository.getNextSequenceCode();

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.TTL_HOURS);

        return this.proformaRepository.create({
            code,
            customerId: dto.customerId,
            sellerId,
            totalAmount,
            status,
            expiresAt,
            details,
        });
    }

    async approve(id: string, managerId: string): Promise<ProformaWithDetails> {
        const proforma = await this.proformaRepository.findById(id);
        if (!proforma) {
            throw new NotFoundException('Proforma no encontrada');
        }

        if (proforma.status !== ProformaStatus.PENDING_APPROVAL) {
            throw new BadRequestException('La proforma no está pendiente de aprobación');
        }

        return this.proformaRepository.changeStatus(id, {
            status: ProformaStatus.APPROVED,
            changedById: managerId,
            reason: 'Aprobación gerencial de Precio 3',
        });
    }

    async reject(id: string, managerId: string, reason: string): Promise<ProformaWithDetails> {
        const proforma = await this.proformaRepository.findById(id);
        if (!proforma) {
            throw new NotFoundException('Proforma no encontrada');
        }

        if (proforma.status !== ProformaStatus.PENDING_APPROVAL) {
            throw new BadRequestException('La proforma no se encuentra en PENDING_APPROVAL');
        }

        return this.proformaRepository.changeStatus(id, {
            status: ProformaStatus.REJECTED,
            changedById: managerId,
            reason: reason || 'Operación descartada por desistimiento en mostrador.',
        });
    }

    async findById(id: string): Promise<ProformaWithDetails> {
        const proforma = await this.proformaRepository.findById(id);
        if (!proforma) {
            throw new NotFoundException('Proforma no encontrada');
        }
        return proforma;
    }

    async findAll(filters: SearchProformaFilters): Promise<ProformaWithDetails[]> {
        return this.proformaRepository.findAll(filters);
    }

    async generatePdf(id: string): Promise<{ buffer: Buffer; fileName: string }> {
        const proforma = await this.findById(id);

        const pdfData = {
            code: proforma.code,
            createdAt: proforma.createdAt,
            expiresAt: proforma.expiresAt,
            customer: {
                name: proforma.customer?.name ?? 'Cliente Desconocido',
                documentNumber: proforma.customer?.documentNumber ?? '-',
                phone: proforma.customer?.phone ?? undefined,
                email: proforma.customer?.email ?? undefined,
                address: proforma.customer?.address ?? undefined,
            },
            seller: {
                email: proforma.seller?.email ?? '-',
            },
            details: (proforma.details ?? []).map((d: any) => ({
                productName: d.product?.name ?? 'Repuesto',
                internalCode: d.product?.internalCode ?? '-',
                quantity: d.quantity,
                unitPrice: Number(d.unitPrice),
                priceTier: d.priceTier,
                subtotal: Number(d.subtotal),
            })),
            totalAmount: Number(proforma.totalAmount),
        };

        const buffer = await this.proformaPdfService.generate(pdfData);
        return {
            buffer,
            fileName: `${proforma.code}.pdf`,
        };
    }

    async cancelProforma(id: string, userId: string, reason?: string): Promise<ProformaWithDetails> {
        const proforma = await this.proformaRepository.findById(id);

        if (!proforma) {
            throw new NotFoundException('Proforma no encontrada.');
        }

        if (proforma.status === ProformaStatus.CONVERTED) {
            throw new BadRequestException('No se puede cancelar una proforma que ya fue cobrada y convertida a venta.');
        }

        if (
            proforma.status !== ProformaStatus.PENDING_APPROVAL &&
            proforma.status !== ProformaStatus.APPROVED &&
            proforma.status !== ProformaStatus.PENDING
        ) {
            throw new BadRequestException('La proforma no se puede cancelar en su estado actual.');
        }

        return this.proformaRepository.changeStatus(id, {
            status: ProformaStatus.REJECTED,
            changedById: userId,
            reason: reason || 'Operación descartada por desistimiento del cliente en caja.',
        });
    }
}