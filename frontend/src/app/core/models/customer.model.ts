// frontend/src/app/core/models/customer.model.ts
export type CustomerType = 'NATURAL' | 'BUSINESS';

export interface Customer {
    id: string;
    type: CustomerType;
    documentNumber: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerPayload {
    type: CustomerType;
    documentNumber: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}