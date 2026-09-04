// src/modules/auth/infrastructure/repositories/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import type { IUserRepository, UserWithProfile } from '../../domain/repositories/user.repository.interface.js';
import type { PasswordResetToken } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string): Promise<UserWithProfile | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: {
                    include: {
                        modules: {
                            include: {
                                module: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
        return this.prisma.passwordResetToken.create({
            data: { userId, token, expiresAt },
        });
    }

    async findResetToken(token: string): Promise<PasswordResetToken | null> {
        return this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }

    async markTokenAsUsed(tokenId: string): Promise<void> {
        await this.prisma.passwordResetToken.update({
            where: { id: tokenId },
            data: { usedAt: new Date() },
        });
    }
}