import { IsNotEmpty, IsUUID, IsArray, ValidateNested, ArrayMinSize, IsNumber, Min, IsInt, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProformaItemDto {
    @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
    @IsNotEmpty()
    productId!: string;

    @IsOptional()
    @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
    supplierId?: string;

    @IsInt({ message: 'La cantidad debe ser un número entero' })
    @Min(1, { message: 'La cantidad mínima es 1' })
    quantity!: number;

    @IsNumber({}, { message: 'El precio unitario debe ser numérico' })
    @Min(0)
    unitPrice!: number;

    @IsInt()
    @Min(1)
    @Max(3, { message: 'El nivel de precio debe ser 1, 2 o 3' })
    priceTier!: number;
}

export class CreateProformaDto {
    @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
    @IsNotEmpty()
    customerId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProformaItemDto)
    @ArrayMinSize(1, { message: 'La proforma debe tener al menos un producto' })
    items!: CreateProformaItemDto[];
}