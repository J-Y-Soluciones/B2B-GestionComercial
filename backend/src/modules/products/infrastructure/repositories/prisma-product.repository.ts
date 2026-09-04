// src/modules/products/infrastructure/repositories/prisma-product.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type {
    IProductRepository,
    ProductWithDetails,
    CreateProductData,
    UpdateProductData,
    SearchProductFilters
} from '../../domain/repositories/product.repository.interface.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<ProductWithDetails | null> {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: { include: { supplier: true } }
            },
        });
    }

    async findByInternalCode(internalCode: string): Promise<ProductWithDetails | null> {
        return this.prisma.product.findUnique({
            where: { internalCode },
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: { include: { supplier: true } }
            },
        });
    }

    async search(filters: SearchProductFilters): Promise<ProductWithDetails[]> {
        const where: Prisma.ProductWhereInput = {
            isActive: true,
        };

        if (filters.query) {
            where.OR = [
                { name: { contains: filters.query, mode: 'insensitive' } },
                { internalCode: { contains: filters.query, mode: 'insensitive' } },
            ];
        }

        if (filters.brand) {
            where.brand = { contains: filters.brand, mode: 'insensitive' };
        }

        if (filters.category) {
            where.category = { contains: filters.category, mode: 'insensitive' };
        }

        if (filters.inStock) {
            where.stocks = {
                some: { stock: { gt: 0 } }
            };
        }

        return this.prisma.product.findMany({
            where,
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: { include: { supplier: true } }
            },
            take: 50,
            orderBy: { name: 'asc' },
        });
    }

    async create(data: CreateProductData): Promise<ProductWithDetails> {
        return this.prisma.product.create({
            data: {
                internalCode: data.internalCode,
                name: data.name,
                category: data.category,
                brand: data.brand,
                ...(data.minStock !== undefined && { minStock: data.minStock }),
                priceTiers: {
                    create: data.priceTiers.map(pt => ({
                        tier: pt.tier,
                        price: pt.price,
                    })),
                },
            },
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: { include: { supplier: true } }
            },
        });
    }

    async update(id: string, data: UpdateProductData): Promise<ProductWithDetails> {
        const updateInput: Prisma.ProductUpdateInput = {
            ...(data.internalCode && { internalCode: data.internalCode }),
            ...(data.name && { name: data.name }),
            ...(data.category && { category: data.category }),
            ...(data.brand && { brand: data.brand }),
            ...(data.minStock !== undefined && { minStock: data.minStock }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        };

        if (data.priceTiers) {
            updateInput.priceTiers = {
                deleteMany: {},
                create: data.priceTiers.map(pt => ({
                    tier: pt.tier,
                    price: pt.price,
                })),
            };
        }

        return this.prisma.product.update({
            where: { id },
            data: updateInput,
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: { include: { supplier: true } }
            },
        });
    }

    async updateStock(productId: string, supplierId: string, quantity: number, costPrice: number = 0): Promise<void> {
        await this.prisma.supplierProductStock.upsert({
            where: {
                productId_supplierId: { productId, supplierId }
            },
            update: {
                stock: quantity,
                ...(costPrice > 0 && { costPrice })
            },
            create: {
                productId,
                supplierId,
                stock: quantity,
                costPrice
            }
        });
    }
}