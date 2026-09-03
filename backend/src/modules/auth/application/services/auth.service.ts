import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from '../dtos/login.dto.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    profileId?: string | null;
    permissions?: Array<{
        moduleCode: string;
        canCreate: boolean;
        canRead: boolean;
        canUpdate: boolean;
        canDelete: boolean;
    }>;
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async validateUserAndGenerateToken(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const permissions = user.profile?.modules.map((pm) => ({
            moduleCode: pm.module.code,
            canCreate: pm.canCreate,
            canRead: pm.canRead,
            canUpdate: pm.canUpdate,
            canDelete: pm.canDelete,
        }));

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            profileId: user.profileId,
            permissions,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
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