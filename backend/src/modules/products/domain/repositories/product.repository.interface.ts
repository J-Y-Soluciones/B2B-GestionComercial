// backend/src/modules/products/domain/repositories/product.repository.interface.ts
import type { Product, PriceTier, SupplierProductStock, Supplier } from '@prisma/client';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export type ProductWithDetails = Product & {
    priceTiers: PriceTier[];
    stocks: (SupplierProductStock & { supplier: Supplier })[];
};

export interface PriceTierData {
    tier: number;
    price: number;
}

export interface CreateProductData {
    internalCode: string;
    name: string;
    category: string;
    brand: string;
    minStock?: number;
    priceTiers: PriceTierData[];
}

export interface UpdateProductData {
    internalCode?: string;
    name?: string;
    category?: string;
    brand?: string;
    minStock?: number;
    isActive?: boolean;
    priceTiers?: PriceTierData[];
}

export interface SearchProductFilters {
    query?: string;
    category?: string;
    brand?: string;
    inStock?: boolean;
}

export interface IProductRepository {
    findById(id: string): Promise<ProductWithDetails | null>;
    findByInternalCode(internalCode: string): Promise<ProductWithDetails | null>;
    search(filters: SearchProductFilters): Promise<ProductWithDetails[]>;
    create(data: CreateProductData): Promise<ProductWithDetails>;
    update(id: string, data: UpdateProductData): Promise<ProductWithDetails>;
    updateStock(productId: string, supplierId: string, quantity: number, costPrice?: number): Promise<void>;
}