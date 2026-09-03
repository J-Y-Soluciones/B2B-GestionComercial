import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service.js';
import { LoginDto } from '../../application/dtos/login.dto.js';
import { ForgotPasswordDto } from '../../application/dtos/forgot-password.dto.js';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
        return this.authService.validateUserAndGenerateToken(loginDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
        return this.authService.resetPassword(dto);
    }
}