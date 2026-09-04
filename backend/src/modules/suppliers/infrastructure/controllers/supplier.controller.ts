// src/modules/suppliers/infrastructure/controllers/supplier.controller.ts
import { Controller, Post, Body, Get, Param, Patch, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SupplierService } from '../../application/services/supplier.service.js';
import { CreateSupplierDto } from '../../application/dtos/create-supplier.dto.js';
import { UpdateSupplierDto } from '../../application/dtos/update-supplier.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard.js';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import type { Supplier } from '@prisma/client';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    @Roles(Role.ADMIN, Role.MANAGER)
    async create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
        return this.supplierService.create(dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    async findAll(): Promise<Supplier[]> {
        return this.supplierService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Supplier> {
        return this.supplierService.findById(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateSupplierDto,
    ): Promise<Supplier> {
        return this.supplierService.update(id, dto);
    }
}