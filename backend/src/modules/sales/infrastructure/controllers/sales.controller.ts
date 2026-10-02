import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SalesService } from '../../application/services/sales.service.js';
import { CreateSaleDto } from '../../application/dtos/create-sale.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
    create(@Body() dto: CreateSaleDto, @Req() req: any) {
        const sellerId = req.user.id || req.user.sub;
        return this.salesService.createSale(dto, sellerId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
    findAll() {
        return this.salesService.getAllSales();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    findOne(@Param('id') id: string) {
        return this.salesService.getSaleById(id);
    }

    @Post(':id/cancel')
    @Roles(Role.ADMIN, Role.MANAGER)
    cancel(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        const userId = req.user?.id || req.user?.sub;
        return this.salesService.cancelSale(id, userId, reason || 'Anulación por mostrador');
    }
}