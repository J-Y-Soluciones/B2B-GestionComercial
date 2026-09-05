// backend/src/modules/customers/domain/entities/customer.entity.ts
import type { CustomerType } from '@prisma/client';

export class CustomerEntity {
  id: string;
  type: CustomerType;
  documentNumber: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CustomerEntity>) {
    Object.assign(this, partial);
  }
}