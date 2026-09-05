// backend/src/modules/customers/application/dtos/create-customer.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf, Matches } from 'class-validator';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @IsEnum(CustomerType, {
    message: 'El tipo de cliente debe ser NATURAL o BUSINESS',
  })
  @IsNotEmpty()
  type!: CustomerType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @ValidateIf((o: CreateCustomerDto) => o.type === CustomerType.NATURAL)
  @Matches(/^[0-9]{8}$/, {
    message: 'El documento para persona NATURAL debe ser un DNI de 8 dígitos numéricos',
  })
  @ValidateIf((o: CreateCustomerDto) => o.type === CustomerType.BUSINESS)
  @Matches(/^(10|20)[0-9]{9}$/, {
    message: 'El documento para persona BUSINESS debe ser un RUC válido de 11 dígitos que inicie con 10 o 20',
  })
  documentNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}