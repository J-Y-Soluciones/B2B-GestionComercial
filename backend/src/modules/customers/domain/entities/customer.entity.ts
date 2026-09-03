// src/modules/customers/domain/entities/customer.entity.ts
import { CustomerType } from '@prisma/client';

export class Customer {
    id: string;
    type: CustomerType;
    documentNumber: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Customer>) {
        this.id = partial.id!;
        this.type = partial.type!;
        this.documentNumber = partial.documentNumber!;
        this.name = partial.name!;
        this.email = partial.email ?? null;
        this.phone = partial.phone ?? null;
        this.address = partial.address ?? null;
        this.createdAt = partial.createdAt!;
        this.updatedAt = partial.updatedAt!;
    }
}