// backend/src/modules/proformas/application/dtos/reject-proforma.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RejectProformaDto {
    @IsString()
    @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
    @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
    reason!: string;
}