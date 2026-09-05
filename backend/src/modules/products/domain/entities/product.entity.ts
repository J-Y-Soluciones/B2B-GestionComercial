// backend/src/modules/products/domain/entities/product.entity.ts
import type { PriceTierEntity } from './price-tier.entity.js';
import type { SupplierStockEntity } from './supplier-stock.entity.js';

export class ProductEntity {
    id: string;
    internalCode: string;
    name: string;
    category: string;
    brand: string;
    minStock: number;
    isActive: boolean;
    totalStock: number;
    priceTiers: PriceTierEntity[];
    stocks: SupplierStockEntity[];
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<ProductEntity>) {
        Object.assign(this, partial);
    }
}