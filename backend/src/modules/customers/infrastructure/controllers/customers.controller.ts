import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from '../../application/services/customers.service.js';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto.js';
import { SearchCustomerDto } from '../../application/dtos/search-customer.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    async create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    @Get('search')
    async search(@Query() query: SearchCustomerDto) {
        return this.customersService.search(query);
    }
}