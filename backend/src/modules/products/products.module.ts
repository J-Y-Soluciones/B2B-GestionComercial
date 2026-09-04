// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './infrastructure/controllers/product.controller.js';
import { ProductService } from './application/services/products.service.js';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository.js';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers: [ProductController],
    providers: [
        {
            provide: PRODUCT_REPOSITORY,
            useClass: PrismaProductRepository,
        },
        ProductService,
    ],
    exports: [ProductService, PRODUCT_REPOSITORY],
})
export class ProductsModule { }