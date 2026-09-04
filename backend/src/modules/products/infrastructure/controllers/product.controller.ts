// src/modules/products/infrastructure/controllers/product.controller.ts
import { Controller, Post, Body, Get, Query, Param, Patch, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ProductService } from '../../application/services/products.service.js';
import { CreateProductDto } from '../../application/dtos/create-product.dto.js';
import { UpdateProductDto } from '../../application/dtos/update-product.dto.js';
import { SearchProductDto } from '../../application/dtos/search-product.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import type { ProductWithDetails } from '../../domain/repositories/product.repository.interface.js';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() dto: CreateProductDto): Promise<ProductWithDetails> {
        return this.productService.create(dto);
    }

    @Get('search')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async search(@Query() filters: SearchProductDto): Promise<ProductWithDetails[]> {
        return this.productService.search(filters);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProductWithDetails> {
        return this.productService.findById(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateProductDto,
    ): Promise<ProductWithDetails> {
        return this.productService.update(id, dto);
    }
}