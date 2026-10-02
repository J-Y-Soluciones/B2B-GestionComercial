// backend/src/modules/auth/infrastructure/strategies/jwt.strategy.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwtStrategy } from './jwt.strategy.js';
import { UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type { JwtPayload } from '../../application/services/auth.service.js';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };

    const mockPayload: JwtPayload = {
        sub: 'user-uuid-1234',
        email: 'admin@vortexyolti.com',
        role: 'ADMIN',
    } as any;

    beforeEach(() => {
        prisma = {
            user: {
                findUnique: vi.fn(),
            },
        };

        strategy = new JwtStrategy(prisma as unknown as PrismaService);
    });

    it('debe validar y retornar el payload si el usuario existe y está activo', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-uuid-1234',
            isActive: true,
        });

        const result = await strategy.validate(mockPayload);

        expect(result).toEqual(mockPayload);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-uuid-1234' },
            select: { id: true, isActive: true },
        });
    });

    it('debe lanzar UnauthorizedException si el usuario ha sido desactivado (H05)', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-uuid-1234',
            isActive: false,
        });

        await expect(strategy.validate(mockPayload)).rejects.toThrow(
            new UnauthorizedException('La cuenta de usuario ha sido desactivada.'),
        );
    });

    it('debe lanzar UnauthorizedException si el usuario ya no existe en la base de datos', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(strategy.validate(mockPayload)).rejects.toThrow(
            new UnauthorizedException('El usuario asociado al token no existe.'),
        );
    });

    it('debe lanzar UnauthorizedException si el payload no contiene identificador de usuario', async () => {
        const invalidPayload = { email: 'sin-sub@vortexyolti.com' } as any;

        await expect(strategy.validate(invalidPayload)).rejects.toThrow(
            new UnauthorizedException('Token inválido: identificador de usuario ausente.'),
        );
    });
});