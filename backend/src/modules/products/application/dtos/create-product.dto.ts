// backend/src/modules/products/application/dtos/create-product.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    ArrayMinSize,
    Min,
    IsNumber,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceTierItemDto {
    @IsInt()
    @Min(1)
    tier!: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price!: number;
}

export class InitialStockItemDto {
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

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    internalCode!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    category!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    brand!: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    minStock?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe configurar al menos un nivel de precio' })
    @ValidateNested({ each: true })
    @Type(() => PriceTierItemDto)
    priceTiers!: PriceTierItemDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InitialStockItemDto)
    stocks?: InitialStockItemDto[];
}