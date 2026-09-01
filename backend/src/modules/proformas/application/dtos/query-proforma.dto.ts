import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProformaStatus } from '@prisma/client';

export class QueryProformaDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(ProformaStatus)
    status?: ProformaStatus;

    @IsOptional()
    @IsUUID('4')
    customerId?: string;
}