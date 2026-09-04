// src/modules/products/application/services/product.service.ts
import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { IProductRepository, ProductWithDetails } from '../../domain/repositories/product.repository.interface.js';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { UpdateProductDto } from '../dtos/update-product.dto.js';
import { SearchProductDto } from '../dtos/search-product.dto.js';

@Injectable()
export class ProductService {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) { }

    async create(dto: CreateProductDto): Promise<ProductWithDetails> {
        const existingProduct = await this.productRepository.findByInternalCode(dto.internalCode);
        if (existingProduct) {
            throw new ConflictException(`Ya existe un producto con el código interno ${dto.internalCode}`);
        }

        return this.productRepository.create({
            internalCode: dto.internalCode,
            name: dto.name,
            category: dto.category,
            brand: dto.brand,
            minStock: dto.minStock,
            priceTiers: dto.priceTiers,
        });
    }

    async update(id: string, dto: UpdateProductDto): Promise<ProductWithDetails> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        if (dto.internalCode && dto.internalCode !== product.internalCode) {
            const existingCode = await this.productRepository.findByInternalCode(dto.internalCode);
            if (existingCode) {
                throw new ConflictException(`El código interno ${dto.internalCode} ya está en uso por otro producto`);
            }
        }

        return this.productRepository.update(id, {
            internalCode: dto.internalCode,
            name: dto.name,
            category: dto.category,
            brand: dto.brand,
            minStock: dto.minStock,
            priceTiers: dto.priceTiers,
        });
    }

    async findById(id: string): Promise<ProductWithDetails> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }
        return product;
    }

    async search(filters: SearchProductDto): Promise<ProductWithDetails[]> {
        return this.productRepository.search(filters);
    }
}