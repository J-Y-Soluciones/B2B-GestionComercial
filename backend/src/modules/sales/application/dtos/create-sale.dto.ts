export class PaymentItemDto {
    method!: 'CASH' | 'CARD_POS' | 'BANK_TRANSFER' | 'YAPE_PLIN';
    amount!: number;
    receivedAmount?: number;
    changeAmount?: number;
    operationCode?: string;
}

export class SaleDetailItemDto {
    productId!: string;
    supplierId!: string;
    quantity!: number;
    unitPrice!: number;
    priceTier!: number;
}

export class CreateSaleDto {
    proformaId?: string;
    customerId!: string;
    invoiceType!: 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';
    notes?: string;
    items!: SaleDetailItemDto[];
    payments!: PaymentItemDto[];
}