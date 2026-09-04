// backend/src/modules/proformas/domain/repositories/proforma.repository.interface.ts
import type { Proforma, ProformaDetail, ProformaStatusLog, ProformaStatus } from '@prisma/client';

export const PROFORMA_REPOSITORY = Symbol('PROFORMA_REPOSITORY');

export type ProformaWithDetails = Proforma & {
    details: ProformaDetail[];
    statusLogs: ProformaStatusLog[];
};

export interface CreateProformaDetailData {
    productId: string;
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
    details: CreateProformaDetailData[];
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

export interface IProformaRepository {
    findById(id: string): Promise<ProformaWithDetails | null>;
    findAll(filters: SearchProformaFilters): Promise<ProformaWithDetails[]>;
    create(data: CreateProformaData): Promise<ProformaWithDetails>;
    changeStatus(id: string, data: ChangeStatusData): Promise<ProformaWithDetails>;
    getNextSequenceCode(): Promise<string>;
}