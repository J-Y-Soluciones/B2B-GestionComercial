// src/modules/auth/application/services/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { LoginDto } from '../dtos/login.dto.js';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUserAndGenerateToken(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
        };
    }
}