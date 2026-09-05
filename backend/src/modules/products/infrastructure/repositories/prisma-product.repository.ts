// backend/src/modules/products/infrastructure/repositories/prisma-product.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type {
    IProductRepository,
    CreateProductData,
    UpdateProductData,
    ProductSearchParams,
    SupplierStockInput,
} from '../../domain/repositories/product.repository.interface.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { PriceTierEntity } from '../../domain/entities/price-tier.entity.js';
import { SupplierStockEntity } from '../../domain/entities/supplier-stock.entity.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(raw: any): ProductEntity {
        const priceTiers = (raw.priceTiers || []).map(
            (tier: any) =>
                new PriceTierEntity({
                    id: tier.id,
                    productId: tier.productId,
                    tier: tier.tier,
                    price: tier.price,
                    createdAt: tier.createdAt,
                }),
        );

        const stocks = (raw.stocks || []).map(
            (stock: any) =>
                new SupplierStockEntity({
                    id: stock.id,
                    productId: stock.productId,
                    supplierId: stock.supplierId,
                    supplierName: stock.supplier?.name,
                    supplierSku: stock.supplierSku,
                    stock: stock.stock,
                    costPrice: stock.costPrice,
                    updatedAt: stock.updatedAt,
                }),
        );

        const totalStock = stocks.reduce((acc: number, curr: SupplierStockEntity) => acc + curr.stock, 0);

        return new ProductEntity({
            id: raw.id,
            internalCode: raw.internalCode,
            name: raw.name,
            category: raw.category,
            brand: raw.brand,
            minStock: raw.minStock,
            isActive: raw.isActive,
            totalStock,
            priceTiers,
            stocks,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    async findById(id: string): Promise<ProductEntity | null> {
        const record = await this.prisma.product.findUnique({
            where: { id },
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: {
                    include: { supplier: { select: { name: true } } },
                },
            },
        });
        return record ? this.mapToEntity(record) : null;
    }

    async findByInternalCode(internalCode: string): Promise<ProductEntity | null> {
        const record = await this.prisma.product.findUnique({
            where: { internalCode },
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: {
                    include: { supplier: { select: { name: true } } },
                },
            },
        });
        return record ? this.mapToEntity(record) : null;
    }

    async search(params: ProductSearchParams): Promise<ProductEntity[]> {
        const where: Prisma.ProductWhereInput = {
            isActive: true,
        };

        if (params.category) {
            where.category = { equals: params.category, mode: 'insensitive' };
        }

        if (params.brand) {
            where.brand = { equals: params.brand, mode: 'insensitive' };
        }

        if (params.query) {
            where.OR = [
                { internalCode: { contains: params.query, mode: 'insensitive' } },
                { name: { contains: params.query, mode: 'insensitive' } },
            ];
        }

        if (params.inStock === true) {
            where.stocks = {
                some: {
                    stock: { gt: 0 },
                },
            };
        }

        const records = await this.prisma.product.findMany({
            where,
            take: params.limit ?? 20,
            include: {
                priceTiers: { orderBy: { tier: 'asc' } },
                stocks: {
                    include: { supplier: { select: { name: true } } },
                },
            },
            orderBy: { name: 'asc' },
        });

        return records.map((r) => this.mapToEntity(r));
    }

    async create(data: CreateProductData): Promise<ProductEntity> {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const created = await tx.product.create({
                data: {
                    internalCode: data.internalCode,
                    name: data.name,
                    category: data.category,
                    brand: data.brand,
                    minStock: data.minStock ?? 5,
                    isActive: data.isActive ?? true,
                    priceTiers: {
                        create: data.priceTiers.map((pt) => ({
                            tier: pt.tier,
                            price: new Prisma.Decimal(pt.price),
                        })),
                    },
                    ...(data.stocks && data.stocks.length > 0 && {
                        stocks: {
                            create: data.stocks.map((st) => ({
                                supplierId: st.supplierId,
                                supplierSku: st.supplierSku ?? null,
                                stock: st.stock,
                                costPrice: new Prisma.Decimal(st.costPrice),
                            })),
                        },
                    }),
                },
                include: {
                    priceTiers: { orderBy: { tier: 'asc' } },
                    stocks: {
                        include: { supplier: { select: { name: true } } },
                    },
                },
            });

            return this.mapToEntity(created);
        });
    }

    async update(id: string, data: UpdateProductData): Promise<ProductEntity> {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            if (data.priceTiers && data.priceTiers.length > 0) {
                for (const tierData of data.priceTiers) {
                    await tx.priceTier.upsert({
                        where: {
                            productId_tier: {
                                productId: id,
                                tier: tierData.tier,
                            },
                        },
                        create: {
                            productId: id,
                            tier: tierData.tier,
                            price: new Prisma.Decimal(tierData.price),
                        },
                        update: {
                            price: new Prisma.Decimal(tierData.price),
                        },
                    });
                }
            }

            const updated = await tx.product.update({
                where: { id },
                data: {
                    ...(data.internalCode !== undefined && { internalCode: data.internalCode }),
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.category !== undefined && { category: data.category }),
                    ...(data.brand !== undefined && { brand: data.brand }),
                    ...(data.minStock !== undefined && { minStock: data.minStock }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                },
                include: {
                    priceTiers: { orderBy: { tier: 'asc' } },
                    stocks: {
                        include: { supplier: { select: { name: true } } },
                    },
                },
            });

            return this.mapToEntity(updated);
        });
    }

    async upsertSupplierStock(productId: string, stockData: SupplierStockInput): Promise<ProductEntity> {
        await this.prisma.supplierProductStock.upsert({
            where: {
                productId_supplierId: {
                    productId,
                    supplierId: stockData.supplierId,
                },
            },
            create: {
                productId,
                supplierId: stockData.supplierId,
                supplierSku: stockData.supplierSku,
                stock: stockData.stock,
                costPrice: new Prisma.Decimal(stockData.costPrice),
            },
            update: {
                supplierSku: stockData.supplierSku,
                stock: stockData.stock,
                costPrice: new Prisma.Decimal(stockData.costPrice),
            },
        });

        const refreshed = await this.findById(productId);
        return refreshed!;
    }
}