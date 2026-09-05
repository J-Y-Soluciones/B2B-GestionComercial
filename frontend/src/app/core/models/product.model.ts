// frontend/src/app/core/models/product.model.ts
export interface PriceTier {
    id: string;
    productId: string;
    tier: number;
    price: string | number;
    createdAt: string;
}

export interface SupplierStock {
    id: string;
    productId: string;
    supplierId: string;
    supplierName?: string;
    supplierSku: string | null;
    stock: number;
    costPrice: string | number;
    updatedAt: string;
}

export interface Product {
    id: string;
    internalCode: string;
    name: string;
    category: string;
    brand: string;
    minStock: number;
    isActive: boolean;
    totalStock: number;
    priceTiers: PriceTier[];
    stocks: SupplierStock[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductSearchFilters {
    query?: string;
    category?: string;
    brand?: string;
    inStock?: boolean;
    limit?: number;
}