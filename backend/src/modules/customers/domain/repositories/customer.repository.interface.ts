// backend/src/modules/customers/domain/repositories/customer.repository.interface.ts
import type { CustomerEntity } from '../entities/customer.entity.js';
import type { CustomerType } from '@prisma/client';

export interface CreateCustomerData {
  type: CustomerType;
  documentNumber: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateCustomerData {
  type?: CustomerType;
  documentNumber?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ICustomerRepository {
  findById(id: string): Promise<CustomerEntity | null>;
  findByDocumentNumber(documentNumber: string): Promise<CustomerEntity | null>;
  search(query: string, limit?: number): Promise<CustomerEntity[]>;
  create(data: CreateCustomerData): Promise<CustomerEntity>;
  update(id: string, data: UpdateCustomerData): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
  countProformas(customerId: string): Promise<number>;
}

export const CUSTOMER_REPOSITORY_TOKEN = Symbol('ICustomerRepository');