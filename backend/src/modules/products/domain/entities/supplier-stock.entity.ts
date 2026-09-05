// backend/src/modules/products/domain/entities/supplier-stock.entity.ts
import { Decimal } from '@prisma/client/runtime/library';

export class SupplierStockEntity {
    id: string;
    productId: string;
    supplierId: string;
    supplierName?: string;
    supplierSku: string | null;
    stock: number;
    costPrice: Decimal;
    updatedAt: Date;

    constructor(partial: Partial<SupplierStockEntity>) {
        Object.assign(this, partial);
    }
}