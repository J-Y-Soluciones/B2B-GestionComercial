// backend/src/modules/products/application/dtos/update-product.dto.ts
import {
    IsString,
    IsOptional,
    IsInt,
    IsBoolean,
    IsArray,
    ValidateNested,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriceTierItemDto } from './create-product.dto.js';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    internalCode?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    brand?: string;

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
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PriceTierItemDto)
    priceTiers?: PriceTierItemDto[];
}