import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
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
import { UsersService } from '../../application/services/users.service.js';
import { CreateUserDto } from '../../application/dtos/create-user.dto.js';
import { UpdateUserDto } from '../../application/dtos/update-user.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.toggleStatus(id);
    }

    @Post(':id/send-reset-password')
    @HttpCode(HttpStatus.OK)
    async sendResetPassword(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.sendPasswordReset(id);
    }
}