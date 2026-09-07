export type PaymentMethod = 'CASH' | 'CARD_POS' | 'BANK_TRANSFER' | 'YAPE_PLIN';
export type InvoiceType = 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';
export type InvoiceStatus = 'PENDING_TRANSMISSION' | 'ACCEPTED' | 'REJECTED' | 'ANULLED';

export interface PaymentItem {
    id?: string;
    method: PaymentMethod;
    amount: number;
    receivedAmount?: number;
    changeAmount?: number;
    operationCode?: string;
    createdAt?: string;
}

export interface SaleDetailItem {
    id?: string;
    productId: string;
    supplierId: string;
    quantity: number;
    unitPrice: number;
    priceTier: number;
    costPrice?: number;
    subtotal: number;
    product?: {
        internalCode: string;
        name: string;
        brand: string;
    };
    supplier?: {
        name: string;
        ruc: string;
    };
}

export interface InvoiceItem {
    id: string;
    saleId: string;
    type: InvoiceType;
    series: string;
    correlative: number;
    fullCode: string;
    status: InvoiceStatus;
    externalId?: string;
    cdrHash?: string;
    errorMessage?: string;
    issuedAt: string;
}

export interface Sale {
    id: string;
    code: string;
    proformaId?: string | null;
    customerId: string;
    sellerId: string;
    subtotal: number;
    igvAmount: number;
    totalAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: string;
        name: string;
        documentNumber: string;
        type: 'NATURAL' | 'BUSINESS';
        email?: string;
        phone?: string;
        address?: string;
    };
    seller?: {
        email: string;
    };
    details: SaleDetailItem[];
    payments: PaymentItem[];
    invoice?: InvoiceItem | null;
}

export interface CreateSalePayload {
    proformaId?: string;
    customerId: string;
    invoiceType: InvoiceType;
    notes?: string;
    items: {
        productId: string;
        supplierId: string;
        quantity: number;
        unitPrice: number;
        priceTier: number;
    }[];
    payments: {
        method: PaymentMethod;
        amount: number;
        receivedAmount?: number;
        changeAmount?: number;
        operationCode?: string;
    }[];
}