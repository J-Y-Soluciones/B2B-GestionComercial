import { IsUUID, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ProformaDetailDto } from './proforma-detail.dto.js';

export class CreateProformaDto {
    @IsUUID('4')
    customerId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => ProformaDetailDto)
    details: ProformaDetailDto[];
}