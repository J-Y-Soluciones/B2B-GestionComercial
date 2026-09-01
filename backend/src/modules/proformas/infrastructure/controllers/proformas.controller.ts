import { Controller, Post, Body, Get, Query, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProformasService } from '../../application/services/proformas.service.js';
import { CreateProformaDto } from '../../application/dtos/create-proforma.dto.js';
import { RejectProformaDto } from '../../application/dtos/reject-proforma.dto.js';
import { QueryProformaDto } from '../../application/dtos/query-proforma.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { JwtPayload } from '../../../auth/application/services/auth.service.js';

@Controller('proformas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProformasController {
    constructor(private readonly proformasService: ProformasService) { }

    @Post()
    @Roles(Role.SELLER, Role.ADMIN, Role.MANAGER)
    async create(@Req() req: { user: JwtPayload }, @Body() dto: CreateProformaDto) {
        return this.proformasService.createProforma(req.user.sub, dto);
    }

    @Get()
    @Roles(Role.SELLER, Role.ADMIN, Role.MANAGER, Role.WAREHOUSE)
    async findAll(@Query() query: QueryProformaDto) {
        return this.proformasService.findAll(query);
    }

    @Patch(':id/approve')
    @Roles(Role.MANAGER, Role.ADMIN)
    async approve(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
        return this.proformasService.approveProforma(id, req.user.sub);
    }

    @Patch(':id/reject')
    @Roles(Role.MANAGER, Role.ADMIN)
    async reject(@Req() req: { user: JwtPayload }, @Param('id') id: string, @Body() dto: RejectProformaDto) {
        return this.proformasService.rejectProforma(id, req.user.sub, dto.reason);
    }
}