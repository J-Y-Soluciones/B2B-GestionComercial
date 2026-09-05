// backend/src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './infrastructure/controllers/product.controller.js';
import { ProductService } from './application/services/products.service.js';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository.js';
import { PRODUCT_REPOSITORY_TOKEN } from './domain/repositories/product.repository.interface.js';

@Module({
    controllers: [ProductController],
    providers: [
        ProductService,
        {
            provide: PRODUCT_REPOSITORY_TOKEN,
            useClass: PrismaProductRepository,
        },
    ],
    exports: [ProductService, PRODUCT_REPOSITORY_TOKEN],
})
export class ProductsModule { }