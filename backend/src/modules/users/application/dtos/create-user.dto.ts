import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email!: string;

    @IsEnum(Role, { message: 'El rol asignado no es válido' })
    role!: Role;

    @IsString()
    @IsOptional()
    name?: string;
}