// frontend/src/app/core/models/proforma.model.ts
import type { Customer } from './customer.model.js';
import type { Product } from './product.model.js';

export type ProformaStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'EXPIRED'
    | 'CONVERTED';

export interface ProformaDetailItem {
    id?: string;
    productId: string;
    supplierId?: string;
    quantity: number;
    unitPrice: number;
    priceTier: number;
    subtotal: number;
    product?: Product;
}

export interface CreateProformaItemPayload {
    productId: string;
    supplierId?: string;
    quantity: number;
    unitPrice: number;
    priceTier: number;
}

export interface CreateProformaPayload {
    customerId: string;
    items: CreateProformaItemPayload[];
}

export interface Proforma {
    id: string;
    code: string;
    customerId: string;
    sellerId: string;
    totalAmount: string | number;
    status: ProformaStatus;
    expiresAt: string;
    customer?: Customer;
    seller?: { id: string; email: string };
    details: ProformaDetailItem[];
    createdAt: string;
    updatedAt: string;
}