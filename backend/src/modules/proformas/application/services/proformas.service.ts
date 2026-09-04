// backend/src/modules/proformas/application/services/proforma.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IProformaRepository, ProformaWithDetails, SearchProformaFilters } from '../../domain/repositories/proforma.repository.interface.js';
import { PROFORMA_REPOSITORY } from '../../domain/repositories/proforma.repository.interface.js';
import { CreateProformaDto } from '../dtos/create-proforma.dto.js';
import { ProformaStatus } from '@prisma/client';

@Injectable()
export class ProformaService {
    private readonly TTL_HOURS = 48;

    constructor(
        @Inject(PROFORMA_REPOSITORY)
        private readonly proformaRepository: IProformaRepository,
    ) { }

    async create(sellerId: string, dto: CreateProformaDto): Promise<ProformaWithDetails> {
        let totalAmount = 0;
        let requiresApproval = false;

        const details = dto.items.map((item) => {
            const subtotal = Number((item.quantity * item.unitPrice).toFixed(2));
            totalAmount = Number((totalAmount + subtotal).toFixed(2));

            if (item.priceTier === 3) {
                requiresApproval = true;
            }

            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
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
            throw new BadRequestException('La proforma no está pendiente de aprobación');
        }

        return this.proformaRepository.changeStatus(id, {
            status: ProformaStatus.REJECTED,
            changedById: managerId,
            reason,
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
}