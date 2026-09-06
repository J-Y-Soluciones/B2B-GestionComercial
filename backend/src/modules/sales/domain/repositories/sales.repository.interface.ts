export interface CreateSaleData {
    code: string;
    proformaId?: string | null;
    customerId: string;
    sellerId: string;
    subtotal: number;
    igvAmount: number;
    totalAmount: number;
    notes?: string;
    items: {
        productId: string;
        supplierId: string;
        quantity: number;
        unitPrice: number;
        priceTier: number;
        costPrice: number;
        subtotal: number;
    }[];
    payments: {
        method: 'CASH' | 'CARD_POS' | 'BANK_TRANSFER' | 'YAPE_PLIN';
        amount: number;
        receivedAmount?: number;
        changeAmount?: number;
        operationCode?: string;
    }[];
    invoice: {
        type: 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';
        series: string;
        correlative: number;
        fullCode: string;
    };
}

export const SALES_REPOSITORY = Symbol('SALES_REPOSITORY');

export interface ISalesRepository {
    executeSaleTransaction(data: CreateSaleData): Promise<any>;
    findSaleById(id: string): Promise<any>;
    findAllSales(): Promise<any[]>;
    countSalesBySeries(series: string): Promise<number>;
    countTotalSales(): Promise<number>;
}