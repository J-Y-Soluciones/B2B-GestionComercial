// src/modules/customers/infrastructure/controllers/customers.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from '../../application/services/customers.service.js';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto.js';
import { SearchCustomerDto } from '../../application/dtos/search-customer.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
    async create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    @Get('search')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
    async search(@Query() query: SearchCustomerDto) {
        return this.customersService.search(query);
    }
}