import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { IUserRepository, UserWithProfile } from '../../domain/repositories/user.repository.interface.js';
import { User, PasswordResetToken } from '@prisma/client';

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

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }

    async createResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
        return this.prisma.passwordResetToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }

    async findResetToken(token: string): Promise<PasswordResetToken | null> {
        return this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
    }

    async markTokenAsUsed(tokenId: string): Promise<void> {
        await this.prisma.passwordResetToken.update({
            where: { id: tokenId },
            data: { usedAt: new Date() },
        });
    }
}