// src/modules/suppliers/suppliers.module.ts
import { Module } from '@nestjs/common';
import { SupplierController } from './infrastructure/controllers/supplier.controller.js';
import { SupplierService } from './application/services/supplier.service.js';
import { PrismaSupplierRepository } from './infrastructure/repositories/prisma-supplier.repository.js';
import { SUPPLIER_REPOSITORY } from './domain/repositories/supplier.repository.interface.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers: [SupplierController],
    providers: [
        {
            provide: SUPPLIER_REPOSITORY,
            useClass: PrismaSupplierRepository,
        },
        SupplierService,
    ],
    exports: [SupplierService, SUPPLIER_REPOSITORY],
})
export class SuppliersModule { }