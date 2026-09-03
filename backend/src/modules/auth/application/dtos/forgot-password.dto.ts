import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'El formato del correo es inválido' })
    email!: string;
}