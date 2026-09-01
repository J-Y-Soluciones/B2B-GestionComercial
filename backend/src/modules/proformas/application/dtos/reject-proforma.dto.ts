import { IsString, IsNotEmpty } from 'class-validator';

export class RejectProformaDto {
    @IsString()
    @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
    reason!: string;
}