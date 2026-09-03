import { User, PasswordResetToken, Profile, ProfileModule, Module } from '@prisma/client';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserWithProfile = User & {
    profile: (Profile & {
        modules: (ProfileModule & { module: Module })[];
    }) | null;
};

export interface IUserRepository {
    findByEmail(email: string): Promise<UserWithProfile | null>;
    findById(id: string): Promise<User | null>;
    updatePassword(userId: string, newPasswordHash: string): Promise<void>;
    createResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
    findResetToken(token: string): Promise<PasswordResetToken | null>;
    markTokenAsUsed(tokenId: string): Promise<void>;
}