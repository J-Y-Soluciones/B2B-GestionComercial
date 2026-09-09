import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { CreateUserDto } from '../dtos/create-user.dto.js';
import { UpdateUserDto } from '../dtos/update-user.dto.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                profile: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                profile: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }

    async create(dto: CreateUserDto) {
        const emailClean = dto.email.toLowerCase().trim();

        const existing = await this.prisma.user.findUnique({
            where: { email: emailClean },
        });

        if (existing) {
            throw new ConflictException(`El correo ${dto.email} ya está registrado`);
        }

        // Contraseña inicial aleatoria (no conocida por nadie)
        const temporarySecret = crypto.randomBytes(24).toString('hex');
        const passwordHash = await bcrypt.hash(temporarySecret, 10);

        const user = await this.prisma.user.create({
            data: {
                email: emailClean,
                passwordHash,
                role: dto.role,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                profile: true,
                createdAt: true,
            },
        });

        // Crear token de activación e invitación (válido por 24 horas)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        console.info(`\n================= [INVITACIÓN / ACTIVACIÓN DE CUENTA] =================`);
        console.info(`Colaborador: ${user.email}`);
        console.info(`Enlace de activación: http://localhost:4200/auth/reset-password?token=${token}`);
        console.info(`=======================================================================\n`);

        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        await this.findById(id);

        if (dto.email) {
            const emailClean = dto.email.toLowerCase().trim();
            const existing = await this.prisma.user.findUnique({
                where: { email: emailClean },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`El correo ${dto.email} ya está en uso`);
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.email && { email: dto.email.toLowerCase().trim() }),
                ...(dto.role && { role: dto.role }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                profile: true,
                updatedAt: true,
            },
        });
    }

    async toggleStatus(id: string, currentUserId?: string) {
        if (currentUserId && id === currentUserId) {
            throw new ConflictException('No puedes desactivar tu propia cuenta de administrador.');
        }

        const user = await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: { id: true, email: true, role: true, isActive: true },
        });
    }

    async sendPasswordReset(id: string) {
        const user = await this.findById(id);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        console.info(`\n================= [RESETEO MANUAL SOLICITADO POR ADMIN] =================`);
        console.info(`Colaborador: ${user.email}`);
        console.info(`Enlace de restablecimiento: http://localhost:4200/auth/reset-password?token=${token}`);
        console.info(`==========================================================================\n`);

        return { message: `Enlace de restablecimiento generado para ${user.email}` };
    }
}