import { IsString, IsEnum, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
    @IsEnum(CustomerType)
    type!: CustomerType;

    @IsString()
    @MaxLength(20)
    documentNumber!: string;

    @IsString()
    @MaxLength(255)
    name!: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}