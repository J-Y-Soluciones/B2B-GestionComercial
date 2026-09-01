import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from '../../application/services/products.service.js';
import { SearchProductDto } from '../../application/dtos/search-product.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async search(@Query() query: SearchProductDto) {
        return this.productsService.searchProducts(query);
    }
}