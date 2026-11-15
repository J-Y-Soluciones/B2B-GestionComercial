// backend/src/modules/auth/auth.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infrastructure/controllers/auth.controller.js';
import { AuthService } from './application/services/auth.service.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { MailService } from '../../core/mail/mail.service.js';

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
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    AuthService,
    JwtStrategy,
    MailService,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    USER_REPOSITORY,
    MailService,
  ],
})
export class AuthModule {}
