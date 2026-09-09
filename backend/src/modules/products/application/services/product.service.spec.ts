// backend/src/modules/products/application/services/products.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from './products.service.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import type { SearchProductDto } from '../dtos/search-product.dto.js';

describe('ProductService', () => {
    let service: ProductService;
    let repository: Partial<IProductRepository>;

    const mockProduct = new ProductEntity({
        id: 'b1d03cb4-77bf-4f51-b8ea-b1981775f0a1',
        internalCode: 'REP-001',
        name: 'Pastillas de Freno Delanteras',
        category: 'Frenos',
        brand: 'Bosch',
        minStock: 5,
        isActive: true,
        totalStock: 20,
        priceTiers: [],
        stocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    beforeEach(() => {
        repository = {
            findById: vi.fn(),
            findByInternalCode: vi.fn(),
            search: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            upsertSupplierStock: vi.fn(),
        };
        service = new ProductService(repository as IProductRepository);
    });

    it('debe buscar un producto por internalCode exitosamente', async () => {
        vi.mocked(repository.findByInternalCode!).mockResolvedValue(mockProduct);

        const result = await service.findByInternalCode('REP-001');

        expect(result).toEqual(mockProduct);
        expect(repository.findByInternalCode).toHaveBeenCalledWith('REP-001');
    });

    it('debe lanzar NotFoundException si el internalCode no existe', async () => {
        vi.mocked(repository.findByInternalCode!).mockResolvedValue(null);

        await expect(service.findByInternalCode('REP-NONEXIST')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('debe lanzar ConflictException al crear con un internalCode ya registrado', async () => {
        vi.mocked(repository.findByInternalCode!).mockResolvedValue(mockProduct);

        await expect(
            service.create({
                internalCode: 'REP-001',
                name: 'Otro repuesto',
                category: 'Motor',
                brand: 'Denso',
                priceTiers: [{ tier: 1, price: 50 }],
            }),
        ).rejects.toThrow(ConflictException);
    });

    it('debe delegar la búsqueda al repositorio con los filtros sanitizados', async () => {
        vi.mocked(repository.search!).mockResolvedValue([mockProduct]);

        const filters: SearchProductDto = {
            query: '   Bosch   ',
            category: 'Frenos',
            inStock: true,
        };

        const result = await service.search(filters, 10);

        expect(result).toEqual([mockProduct]);
        expect(repository.search).toHaveBeenCalledWith({
            query: 'Bosch',
            category: 'Frenos',
            brand: undefined,
            inStock: true,
            limit: 10,
        });
    });

    it('debe pasar undefined en campos vacíos o con solo espacios al buscar', async () => {
        vi.mocked(repository.search!).mockResolvedValue([]);

        const filters: SearchProductDto = {
            query: '   ',
        };

        const result = await service.search(filters);

        expect(result).toEqual([]);
        expect(repository.search).toHaveBeenCalledWith({
            query: undefined,
            category: undefined,
            brand: undefined,
            inStock: undefined,
            limit: 20,
        });
    });
});