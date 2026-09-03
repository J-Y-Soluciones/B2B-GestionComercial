// src/modules/customers/domain/repositories/customer.repository.interface.ts
import { Customer, Prisma } from '@prisma/client';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface ICustomerRepository {
    findByDocument(documentNumber: string): Promise<Customer | null>;
    search(query: string): Promise<Customer[]>;
    create(data: Prisma.CustomerCreateInput): Promise<Customer>;
}