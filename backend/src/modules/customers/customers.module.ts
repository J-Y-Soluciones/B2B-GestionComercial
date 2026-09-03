// src/modules/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { CustomersController } from './infrastructure/controllers/customers.controller.js';
import { CustomersService } from './application/services/customers.service.js';
import { PrismaCustomerRepository } from './infrastructure/repositories/prisma-customer.repository.js';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.interface.js';

@Module({
    controllers: [CustomersController],
    providers: [
        CustomersService,
        {
            provide: CUSTOMER_REPOSITORY,
            useClass: PrismaCustomerRepository,
        },
    ],
    exports: [CustomersService],
})
export class CustomersModule { }