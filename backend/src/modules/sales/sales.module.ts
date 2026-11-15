// backend/src/modules/sales/sales.module.ts
import { Module } from '@nestjs/common';
import { SalesController } from './infrastructure/controllers/sales.controller.js';
import { SalesService } from './application/services/sales.service.js';
import { SALES_REPOSITORY } from './domain/repositories/sales.repository.interface.js';
import { PrismaSalesRepository } from './infrastructure/repositories/prisma-sales.repository.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { NubefactService } from './infrastructure/services/nubefact.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [
    SalesService,
    NubefactService,
    {
      provide: SALES_REPOSITORY,
      useClass: PrismaSalesRepository,
    },
  ],
  exports: [SalesService, NubefactService],
})
export class SalesModule {}
