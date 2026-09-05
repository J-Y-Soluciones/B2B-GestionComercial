// backend/src/modules/customers/infrastructure/repositories/prisma-customer.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type {
  ICustomerRepository,
  CreateCustomerData,
  UpdateCustomerData,
} from '../../domain/repositories/customer.repository.interface.js';
import { CustomerEntity } from '../../domain/entities/customer.entity.js';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustomerEntity | null> {
    const record = await this.prisma.customer.findUnique({
      where: { id },
    });
    return record ? new CustomerEntity(record) : null;
  }

  async findByDocumentNumber(documentNumber: string): Promise<CustomerEntity | null> {
    const record = await this.prisma.customer.findUnique({
      where: { documentNumber },
    });
    return record ? new CustomerEntity(record) : null;
  }

  async search(query: string, limit = 10): Promise<CustomerEntity[]> {
    const records = await this.prisma.customer.findMany({
      where: {
        OR: [
          { documentNumber: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
    return records.map((record) => new CustomerEntity(record));
  }

  async create(data: CreateCustomerData): Promise<CustomerEntity> {
    const created = await this.prisma.customer.create({
      data: {
        type: data.type,
        documentNumber: data.documentNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    return new CustomerEntity(created);
  }

  async update(id: string, data: UpdateCustomerData): Promise<CustomerEntity> {
    const updated = await this.prisma.customer.update({
      where: { id },
      data,
    });
    return new CustomerEntity(updated);
  }
}