import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsArray,
    ValidateNested,
    Min
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethodEnum {
    CASH = 'CASH',
    CARD_POS = 'CARD_POS',
    BANK_TRANSFER = 'BANK_TRANSFER',
    YAPE_PLIN = 'YAPE_PLIN',
}

export enum InvoiceTypeEnum {
    BOLETA = 'BOLETA',
    FACTURA = 'FACTURA',
    NOTA_VENTA = 'NOTA_VENTA',
}

export class PaymentItemDto {
    @IsEnum(PaymentMethodEnum)
    @IsNotEmpty()
    method!: 'CASH' | 'CARD_POS' | 'BANK_TRANSFER' | 'YAPE_PLIN';

    @IsNumber()
    @Min(0)
    amount!: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    receivedAmount?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    changeAmount?: number;

    @IsString()
    @IsOptional()
    operationCode?: string;
}

export class SaleDetailItemDto {
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @IsString()
    @IsNotEmpty()
    supplierId!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;

    @IsNumber()
    @Min(0)
    unitPrice!: number;

    @IsNumber()
    priceTier!: number;
}

export class CreateSaleDto {
    @IsString()
    @IsOptional()
    proformaId?: string;

    @IsString()
    @IsNotEmpty()
    customerId!: string;

    @IsEnum(InvoiceTypeEnum)
    @IsNotEmpty()
    invoiceType!: 'BOLETA' | 'FACTURA' | 'NOTA_VENTA';

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleDetailItemDto)
    items!: SaleDetailItemDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentItemDto)
    payments!: PaymentItemDto[];
}