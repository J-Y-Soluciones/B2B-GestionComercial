// src/modules/suppliers/application/services/supplier.service.ts
import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { ISupplierRepository } from '../../domain/repositories/supplier.repository.interface.js';
import { SUPPLIER_REPOSITORY } from '../../domain/repositories/supplier.repository.interface.js';
import { CreateSupplierDto } from '../dtos/create-supplier.dto.js';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto.js';
import type { Supplier } from '@prisma/client';

@Injectable()
export class SupplierService {
    constructor(
        @Inject(SUPPLIER_REPOSITORY)
        private readonly supplierRepository: ISupplierRepository,
    ) { }

    async create(dto: CreateSupplierDto): Promise<Supplier> {
        const existingSupplier = await this.supplierRepository.findByRuc(dto.ruc);
        if (existingSupplier) {
            throw new ConflictException(`Ya existe un proveedor con el RUC ${dto.ruc}`);
        }

        return this.supplierRepository.create({
            ruc: dto.ruc,
            name: dto.name,
            contactName: dto.contactName ?? null,
            phone: dto.phone ?? null,
            email: dto.email ?? null,
            isActive: true,
        });
    }

    async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        if (dto.ruc && dto.ruc !== supplier.ruc) {
            const existingRuc = await this.supplierRepository.findByRuc(dto.ruc);
            if (existingRuc) {
                throw new ConflictException(`El RUC ${dto.ruc} ya está en uso por otro proveedor`);
            }
        }

        return this.supplierRepository.update(id, {
            ruc: dto.ruc,
            name: dto.name,
            contactName: dto.contactName,
            phone: dto.phone,
            email: dto.email,
        });
    }

    async findById(id: string): Promise<Supplier> {
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) {
            throw new NotFoundException('Proveedor no encontrado');
        }
        return supplier;
    }

    async findAll(): Promise<Supplier[]> {
        return this.supplierRepository.findAll();
    }
}