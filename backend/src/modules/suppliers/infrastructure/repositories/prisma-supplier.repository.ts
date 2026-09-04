// src/modules/suppliers/infrastructure/repositories/prisma-supplier.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type { ISupplierRepository } from '../../domain/repositories/supplier.repository.interface.js';
import type { Supplier } from '@prisma/client';

@Injectable()
export class PrismaSupplierRepository implements ISupplierRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Supplier | null> {
        return this.prisma.supplier.findUnique({
            where: { id },
        });
    }

    async findByRuc(ruc: string): Promise<Supplier | null> {
        return this.prisma.supplier.findUnique({
            where: { ruc },
        });
    }

    async findAll(): Promise<Supplier[]> {
        return this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
        return this.prisma.supplier.create({
            data,
        });
    }

    async update(id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supplier> {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
}