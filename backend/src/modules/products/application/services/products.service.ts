import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { SearchProductDto } from '../dtos/search-product.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async searchProducts(query: SearchProductDto) {
        const { search } = query;

        const where: Prisma.ProductWhereInput = {
            isActive: true,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { internalCode: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        return this.prisma.product.findMany({
            where,
            include: {
                priceTiers: {
                    orderBy: { tier: 'asc' },
                },
            },
            take: 20,
        });
    }
}