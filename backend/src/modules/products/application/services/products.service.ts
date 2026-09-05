// backend/src/modules/products/application/services/product.service.ts
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import {
    PRODUCT_REPOSITORY_TOKEN,
    type IProductRepository,
} from '../../domain/repositories/product.repository.interface.js';
import type { ProductEntity } from '../../domain/entities/product.entity.js';
import type { CreateProductDto } from '../dtos/create-product.dto.js';
import type { UpdateProductDto } from '../dtos/update-product.dto.js';
import type { SetSupplierStockDto } from '../dtos/set-supplier-stock.dto.js';
import type { SearchProductDto } from '../dtos/search-product.dto.js';

function normalizeText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

@Injectable()
export class ProductService {
    constructor(
        @Inject(PRODUCT_REPOSITORY_TOKEN)
        private readonly productRepository: IProductRepository,
    ) { }

    async findById(id: string): Promise<ProductEntity> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return product;
    }

    async findByInternalCode(internalCode: string): Promise<ProductEntity> {
        const product = await this.productRepository.findByInternalCode(internalCode);
        if (!product) {
            throw new NotFoundException(`Producto con código interno ${internalCode} no encontrado`);
        }
        return product;
    }

    async search(filters: SearchProductDto, limit = 20): Promise<ProductEntity[]> {
        const hasQuery = Boolean(filters.query?.trim());

        const results = await this.productRepository.search({
            query: hasQuery ? undefined : undefined,
            category: filters.category?.trim() || undefined,
            brand: filters.brand?.trim() || undefined,
            inStock: filters.inStock,
            limit: hasQuery ? 100 : limit,
        });

        if (!hasQuery) {
            return results.slice(0, limit);
        }

        const normalizedQuery = normalizeText(filters.query!);

        return results
            .filter((product) => {
                const name = normalizeText(product.name);
                const code = normalizeText(product.internalCode);
                const brand = normalizeText(product.brand);

                return (
                    name.includes(normalizedQuery) ||
                    code.includes(normalizedQuery) ||
                    brand.includes(normalizedQuery)
                );
            })
            .slice(0, limit);
    }

    async create(dto: CreateProductDto): Promise<ProductEntity> {
        const existing = await this.productRepository.findByInternalCode(dto.internalCode);
        if (existing) {
            throw new ConflictException(`Ya existe un repuesto con el código interno ${dto.internalCode}`);
        }

        return this.productRepository.create({
            internalCode: dto.internalCode,
            name: dto.name,
            category: dto.category,
            brand: dto.brand,
            minStock: dto.minStock ?? 5,
            isActive: dto.isActive ?? true,
            priceTiers: dto.priceTiers,
            stocks: dto.stocks ?? [],
        });
    }

    async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
        await this.findById(id);

        if (dto.internalCode) {
            const duplicate = await this.productRepository.findByInternalCode(dto.internalCode);
            if (duplicate && duplicate.id !== id) {
                throw new ConflictException(
                    `El código ${dto.internalCode} ya está asignado a otro repuesto`,
                );
            }
        }

        return this.productRepository.update(id, {
            ...(dto.internalCode !== undefined && { internalCode: dto.internalCode }),
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.category !== undefined && { category: dto.category }),
            ...(dto.brand !== undefined && { brand: dto.brand }),
            ...(dto.minStock !== undefined && { minStock: dto.minStock }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            ...(dto.priceTiers !== undefined && { priceTiers: dto.priceTiers }),
        });
    }

    async setSupplierStock(id: string, dto: SetSupplierStockDto): Promise<ProductEntity> {
        await this.findById(id);
        return this.productRepository.upsertSupplierStock(id, {
            supplierId: dto.supplierId,
            supplierSku: dto.supplierSku ?? null,
            stock: dto.stock,
            costPrice: dto.costPrice,
        });
    }
}