// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProformasModule } from './modules/proformas/proformas.module.js';
import { CustomerModule } from './modules/customers/customers.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { SalesModule } from './modules/sales/sales.module.js'; // <-- Importar aquí

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    ProformasModule,
    CustomerModule,
    ProductsModule,
    SuppliersModule,
    UsersModule,
    SalesModule,
  ],
})
export class AppModule { }