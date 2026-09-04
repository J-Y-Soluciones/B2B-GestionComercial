// backend/src/modules/auth/application/services/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from '../dtos/login.dto.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

export interface UserPermissionItem {
    moduleCode: string;
    name: string;
    path: string;
    icon: string | null;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        role: string;
        profile: {
            id: string;
            name: string;
        } | null;
        modules: UserPermissionItem[];
    };
}

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    profileId?: string | null;
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async validateUserAndGenerateToken(loginDto: LoginDto): Promise<LoginResponse> {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Mapear los módulos autorizados (únicamente los que tienen canRead en true)
        const activeModules: UserPermissionItem[] = (user.profile?.modules ?? [])
            .filter((pm) => pm.canRead)
            .map((pm) => ({
                moduleCode: pm.module.code,
                name: pm.module.name,
                path: pm.module.path,
                icon: pm.module.icon,
                canCreate: pm.canCreate,
                canRead: pm.canRead,
                canUpdate: pm.canUpdate,
                canDelete: pm.canDelete,
            }));

        // Mantener el payload del JWT ligero para no inflar las cabeceras HTTP
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            profileId: user.profileId,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.profile
                    ? {
                        id: user.profile.id,
                        name: user.profile.name,
                    }
                    : null,
                modules: activeModules,
            },
        };
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user || !user.isActive) {
            return { message: 'Si el correo existe, se enviarán las instrucciones de recuperación.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await this.userRepository.createResetToken(user.id, token, expiresAt);

        console.info(`[EMAIL MOCK] Recuperación solicitada para ${user.email}. Token: ${token}`);

        return { message: 'Si el correo existe, se enviarán las instrucciones de recuperación.' };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const resetToken = await this.userRepository.findResetToken(dto.token);

        if (!resetToken) {
            throw new BadRequestException('Token inválido o no encontrado');
        }

        if (resetToken.usedAt !== null) {
            throw new BadRequestException('El token ya ha sido utilizado');
        }

        if (new Date() > resetToken.expiresAt) {
            throw new BadRequestException('El token ha expirado');
        }

        const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

        await this.userRepository.updatePassword(resetToken.userId, newPasswordHash);
        await this.userRepository.markTokenAsUsed(resetToken.id);

        return { message: 'Contraseña actualizada correctamente' };
    }
}