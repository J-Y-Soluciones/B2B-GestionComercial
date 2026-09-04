// src/modules/suppliers/application/dtos/create-supplier.dto.ts
import { IsString, IsNotEmpty, Length, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty({ message: 'El RUC es obligatorio' })
    @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
    ruc!: string;

    @IsString()
    @IsNotEmpty({ message: 'La razón social es obligatoria' })
    @MaxLength(255, { message: 'La razón social no puede exceder los 255 caracteres' })
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    contactName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'El formato del correo es inválido' })
    @MaxLength(255)
    email?: string;
}