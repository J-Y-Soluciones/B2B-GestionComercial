// backend/src/modules/products/application/dtos/set-supplier-stock.dto.ts
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsInt, Min, IsNumber, IsPositive, MaxLength } from 'class-validator';

export class SetSupplierStockDto {
    @IsUUID('4')
    @IsNotEmpty()
    supplierId!: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    supplierSku?: string;

    @IsInt()
    @Min(0)
    stock!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    costPrice!: number;
}