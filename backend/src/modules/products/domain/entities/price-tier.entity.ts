// backend/src/modules/products/domain/entities/price-tier.entity.ts
import { Decimal } from '@prisma/client/runtime/library';

export class PriceTierEntity {
    id: string;
    productId: string;
    tier: number;
    price: Decimal;
    createdAt: Date;

    constructor(partial: Partial<PriceTierEntity>) {
        Object.assign(this, partial);
    }
}