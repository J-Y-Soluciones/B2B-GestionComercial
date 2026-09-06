import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SalesService } from '../../application/services/sales.service.js';
import { CreateSaleDto } from '../../application/dtos/create-sale.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    create(@Body() dto: CreateSaleDto, @Req() req: any) {
        const sellerId = req.user.id || req.user.sub;
        return this.salesService.createSale(dto, sellerId);
    }

    @Get()
    findAll() {
        return this.salesService.getAllSales();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.getSaleById(id);
    }
}