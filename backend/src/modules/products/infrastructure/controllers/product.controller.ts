// backend/src/modules/products/infrastructure/controllers/product.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { ProductService } from '../../application/services/products.service.js';
import { CreateProductDto } from '../../application/dtos/create-product.dto.js';
import { UpdateProductDto } from '../../application/dtos/update-product.dto.js';
import { SetSupplierStockDto } from '../../application/dtos/set-supplier-stock.dto.js';
import { SearchProductDto } from '../../application/dtos/search-product.dto.js';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get('search')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async search(
        @Query() filters: SearchProductDto,
        @Query('limit') limit?: string,
    ) {
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        return this.productService.search(filters, parsedLimit);
    }

    @Get('by-code/:code')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async findByInternalCode(@Param('code') code: string) {
        return this.productService.findByInternalCode(code);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER, Role.WAREHOUSE)
    async findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.productService.findById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productService.update(id, dto);
    }

    @Put(':id/stock')
    @Roles(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE)
    async setSupplierStock(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: SetSupplierStockDto,
    ) {
        return this.productService.setSupplierStock(id, dto);
    }
}