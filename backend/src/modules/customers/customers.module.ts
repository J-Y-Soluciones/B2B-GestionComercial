// backend/src/modules/customers/customer.module.ts
import { Module } from '@nestjs/common';
import { CustomerController } from './infrastructure/controllers/customers.controller.js';
import { CustomerService } from './application/services/customers.service.js';
import { PrismaCustomerRepository } from './infrastructure/repositories/prisma-customer.repository.js';
import { CUSTOMER_REPOSITORY_TOKEN } from './domain/repositories/customer.repository.interface.js';

@Module({
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CustomerService, CUSTOMER_REPOSITORY_TOKEN],
})
export class CustomerModule {}