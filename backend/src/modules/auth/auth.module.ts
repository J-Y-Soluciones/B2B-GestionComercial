import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infrastructure/controllers/auth.controller.js';
import { AuthService } from './application/services/auth.service.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Global()
@Module({
    imports: [
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env['JWT_SECRET'] || 'vortex-yolti-super-secret-key-2024',
            signOptions: { expiresIn: '8h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }