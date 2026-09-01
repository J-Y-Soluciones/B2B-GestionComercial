import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class ProformaDetailDto {
    @IsUUID('4')
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsInt()
    @Min(1)
    @Max(3)
    priceTier: number;
}