import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProformasModule } from './modules/proformas/proformas.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProformasModule,
    ProductsModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }