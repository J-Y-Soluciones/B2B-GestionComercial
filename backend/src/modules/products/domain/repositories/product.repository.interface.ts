// backend/src/modules/products/domain/repositories/product.repository.interface.ts
import type { ProductEntity } from '../entities/product.entity.js';

export interface PriceTierInput {
    tier: number;
    price: number;
}

export interface SupplierStockInput {
    supplierId: string;
    supplierSku?: string | null;
    stock: number;
    costPrice: number;
}

export interface CreateProductData {
    internalCode: string;
    name: string;
    category: string;
    brand: string;
    minStock?: number;
    isActive?: boolean;
    priceTiers: PriceTierInput[];
    stocks?: SupplierStockInput[];
}

export interface UpdateProductData {
    internalCode?: string;
    name?: string;
    category?: string;
    brand?: string;
    minStock?: number;
    isActive?: boolean;
    priceTiers?: PriceTierInput[];
}

export interface ProductSearchParams {
    query?: string;
    category?: string;
    brand?: string;
    inStock?: boolean;
    limit?: number;
}

export interface IProductRepository {
    findById(id: string): Promise<ProductEntity | null>;
    findByInternalCode(internalCode: string): Promise<ProductEntity | null>;
    search(params: ProductSearchParams): Promise<ProductEntity[]>;
    create(data: CreateProductData): Promise<ProductEntity>;
    update(id: string, data: UpdateProductData): Promise<ProductEntity>;
    upsertSupplierStock(productId: string, stockData: SupplierStockInput): Promise<ProductEntity>;
}

export const PRODUCT_REPOSITORY_TOKEN = Symbol('IProductRepository');