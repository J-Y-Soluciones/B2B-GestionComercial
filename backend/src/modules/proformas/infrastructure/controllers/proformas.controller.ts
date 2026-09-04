// backend/src/modules/proformas/infrastructure/controllers/proforma.controller.ts
import { Controller, Post, Body, Get, Query, Param, Patch, UseGuards, ParseUUIDPipe, Req, Res } from '@nestjs/common';
import { ProformaService } from '../../application/services/proformas.service.js';
import { CreateProformaDto } from '../../application/dtos/create-proforma.dto.js';
import { RejectProformaDto } from '../../application/dtos/reject-proforma.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role, ProformaStatus } from '@prisma/client';
import type { ProformaWithDetails } from '../../domain/repositories/proforma.repository.interface.js';
import type { Response } from 'express';

interface AuthenticatedUser {
    id?: string;
    sub?: string;
    email: string;
    role: Role;
}

interface RequestWithUser {
    user: AuthenticatedUser;
}

@Controller('proformas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProformaController {
    constructor(private readonly proformaService: ProformaService) { }

    private extractUserId(user: AuthenticatedUser): string {
        return (user.id ?? user.sub) as string;
    }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
    async create(
        @Req() req: RequestWithUser,
        @Body() dto: CreateProformaDto,
    ): Promise<ProformaWithDetails> {
        return this.proformaService.create(this.extractUserId(req.user), dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async findAll(
        @Query('customerId') customerId?: string,
        @Query('sellerId') sellerId?: string,
        @Query('status') status?: ProformaStatus,
    ): Promise<ProformaWithDetails[]> {
        return this.proformaService.findAll({ customerId, sellerId, status });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProformaWithDetails> {
        return this.proformaService.findById(id);
    }

    @Patch(':id/approve')
    @Roles(Role.ADMIN, Role.MANAGER)
    async approve(
        @Req() req: RequestWithUser,
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<ProformaWithDetails> {
        return this.proformaService.approve(id, this.extractUserId(req.user));
    }

    @Patch(':id/reject')
    @Roles(Role.ADMIN, Role.MANAGER)
    async reject(
        @Req() req: RequestWithUser,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: RejectProformaDto,
    ): Promise<ProformaWithDetails> {
        return this.proformaService.reject(id, this.extractUserId(req.user), dto.reason);
    }

    @Get(':id/pdf')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async downloadPdf(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Res() res: Response,
    ): Promise<void> {
        const { buffer, fileName } = await this.proformaService.generatePdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}