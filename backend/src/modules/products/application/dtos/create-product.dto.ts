// src/modules/products/application/dtos/create-product.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, Min, MaxLength, IsInt, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PriceTierDto {
    @IsInt({ message: 'El nivel (tier) debe ser un número entero' })
    @Min(1)
    @Max(3)
    tier!: number;

    @IsNumber({}, { message: 'El precio debe ser un valor numérico' })
    @Min(0)
    price!: number;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'El código interno es obligatorio' })
    @MaxLength(50)
    internalCode!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MaxLength(255)
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'La categoría es obligatoria' })
    @MaxLength(100)
    category!: string;

    @IsString()
    @IsNotEmpty({ message: 'La marca es obligatoria' })
    @MaxLength(100)
    brand!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    minStock?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PriceTierDto)
    @ArrayMinSize(3, { message: 'Debe proporcionar exactamente 3 niveles de precio' })
    @ArrayMaxSize(3, { message: 'Debe proporcionar exactamente 3 niveles de precio' })
    priceTiers!: PriceTierDto[];
}