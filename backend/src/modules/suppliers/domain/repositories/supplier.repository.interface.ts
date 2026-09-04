// src/modules/suppliers/domain/repositories/supplier.repository.interface.ts
import type { Supplier } from '@prisma/client';

export const SUPPLIER_REPOSITORY = Symbol('SUPPLIER_REPOSITORY');

export type CreateSupplierData = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
    isActive?: boolean;
};

export type UpdateSupplierData = Partial<CreateSupplierData>;

export interface ISupplierRepository {
    findById(id: string): Promise<Supplier | null>;
    findByRuc(ruc: string): Promise<Supplier | null>;
    findAll(): Promise<Supplier[]>;
    create(data: CreateSupplierData): Promise<Supplier>;
    update(id: string, data: UpdateSupplierData): Promise<Supplier>;
}