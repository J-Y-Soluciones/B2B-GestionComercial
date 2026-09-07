// backend/src/modules/proformas/domain/repositories/proforma.repository.interface.ts
import { Proforma, ProformaDetail, ProformaStatusLog, Customer, Product, ProformaStatus } from '@prisma/client';

export type ProformaDetailWithProduct = ProformaDetail & {
    product?: Product;
};

export type ProformaWithDetails = Proforma & {
    customer?: Customer;
    seller?: {
        id: string;
        email: string;
        role?: string;
    };
    details: ProformaDetailWithProduct[];
    statusLogs?: (ProformaStatusLog & {
        changedBy?: {
            email: string;
        };
    })[];
};

export interface CreateProformaItemData {
    productId: string;
    supplierId?: string;
    quantity: number;
    unitPrice: number;
    priceTier: number;
    subtotal: number;
}

export interface CreateProformaData {
    code: string;
    customerId: string;
    sellerId: string;
    totalAmount: number;
    status: ProformaStatus;
    expiresAt: Date;
    details: CreateProformaItemData[];
}

export interface ChangeStatusData {
    status: ProformaStatus;
    changedById: string;
    reason?: string;
}

export interface SearchProformaFilters {
    customerId?: string;
    sellerId?: string;
    status?: ProformaStatus;
}

export const PROFORMA_REPOSITORY = Symbol('PROFORMA_REPOSITORY');

export interface IProformaRepository {
    findById(id: string): Promise<ProformaWithDetails | null>;
    findAll(filters: SearchProformaFilters): Promise<ProformaWithDetails[]>;
    create(data: CreateProformaData): Promise<ProformaWithDetails>;
    changeStatus(id: string, data: ChangeStatusData): Promise<ProformaWithDetails>;
    getNextSequenceCode(): Promise<string>;
}