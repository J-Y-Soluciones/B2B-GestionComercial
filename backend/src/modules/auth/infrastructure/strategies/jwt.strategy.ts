// src/modules/auth/infrastructure/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../application/services/auth.service.js';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env['JWT_SECRET'] || 'vortex-yolti-super-secret-key-2024',
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        const userId = payload.sub || (payload as any).id;

        if (!userId) {
            throw new UnauthorizedException('Token inválido: identificador de usuario ausente.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,     // <--- Traer rol real de la BD
                isActive: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('El usuario asociado al token no existe.');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('La cuenta de usuario ha sido desactivada.');
        }

        return {
            ...payload,
            role: user.role,
        };
    }
}