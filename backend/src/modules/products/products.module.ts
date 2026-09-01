import { Module } from '@nestjs/common';
import { ProductsController } from './infrastructure/controllers/products.controller.js';
import { ProductsService } from './application/services/products.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }