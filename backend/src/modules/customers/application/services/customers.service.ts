import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { CreateCustomerDto } from '../dtos/create-customer.dto.js';
import { SearchCustomerDto } from '../dtos/search-customer.dto.js';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCustomerDto) {
        const existing = await this.prisma.customer.findUnique({
            where: { documentNumber: dto.documentNumber },
        });

        if (existing) {
            throw new ConflictException('Ya existe un cliente con este documento');
        }

        return this.prisma.customer.create({
            data: dto,
        });
    }

    async search(dto: SearchCustomerDto) {
        return this.prisma.customer.findMany({
            where: {
                OR: [
                    { documentNumber: { contains: dto.query } },
                    { name: { contains: dto.query, mode: 'insensitive' } },
                ],
            },
            take: 10,
        });
    }
}