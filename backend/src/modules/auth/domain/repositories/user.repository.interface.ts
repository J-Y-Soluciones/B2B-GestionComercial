// src/modules/auth/domain/repositories/user.repository.interface.ts
import type { User, Profile, ProfileModule, Module, PasswordResetToken } from '@prisma/client';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserWithProfile = User & {
    profile: (Profile & {
        modules: (ProfileModule & {
            module: Module;
        })[];
    }) | null;
};

export interface IUserRepository {
    findByEmail(email: string): Promise<UserWithProfile | null>;
    createResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
    findResetToken(token: string): Promise<PasswordResetToken | null>;
    updatePassword(userId: string, passwordHash: string): Promise<void>;
    markTokenAsUsed(tokenId: string): Promise<void>;
}