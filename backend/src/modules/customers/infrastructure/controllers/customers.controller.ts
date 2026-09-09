// backend/src/modules/customers/infrastructure/controllers/customer.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CustomerService } from '../../application/services/customers.service.js';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto.js';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto.js';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get('search')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
  async search(@Query('query') query: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.customerService.search(query ?? '', parsedLimit);
  }

  @Get('by-document/:documentNumber')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
  async findByDocumentNumber(@Param('documentNumber') documentNumber: string) {
    return this.customerService.findByDocumentNumber(documentNumber);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.customerService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SELLER)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.customerService.delete(id);
  }
}