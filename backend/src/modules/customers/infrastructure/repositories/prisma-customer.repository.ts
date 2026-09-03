// src/modules/customers/infrastructure/repositories/prisma-customer.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByDocument(documentNumber: string): Promise<Customer | null> {
        return this.prisma.customer.findUnique({
            where: { documentNumber },
        });
    }

    async search(query: string): Promise<Customer[]> {
        return this.prisma.customer.findMany({
            where: {
                OR: [
                    { documentNumber: { contains: query } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 10,
        });
    }

    async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
        return this.prisma.customer.create({ data });
    }
}