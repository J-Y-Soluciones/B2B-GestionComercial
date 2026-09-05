// backend/src/modules/suppliers/application/services/supplier.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupplierService } from './supplier.service.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ISupplierRepository } from '../../domain/repositories/supplier.repository.interface.js';
import type { Supplier } from '@prisma/client';

describe('SupplierService', () => {
    let service: SupplierService;
    let repository: Partial<ISupplierRepository>;

    const mockSupplier: Supplier = {
        id: 'f3b25bb4-44aa-4927-99ea-1c233342bf22',
        ruc: '20100070970',
        name: 'Distribuidora Automotriz S.A.C.',
        contactName: 'Carlos Ramirez',
        phone: '014445555',
        email: 'contacto@distribuidora.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        repository = {
            findById: vi.fn(),
            findByRuc: vi.fn(),
            findAll: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        };
        service = new SupplierService(repository as ISupplierRepository);
    });

    describe('create', () => {
        it('debe registrar un proveedor cuando el RUC no existe', async () => {
            vi.mocked(repository.findByRuc!).mockResolvedValue(null);
            vi.mocked(repository.create!).mockResolvedValue(mockSupplier);

            const dto = {
                ruc: '20100070970',
                name: 'Distribuidora Automotriz S.A.C.',
                contactName: 'Carlos Ramirez',
            };

            const result = await service.create(dto);

            expect(result).toEqual(mockSupplier);
            expect(repository.create).toHaveBeenCalledWith({
                ruc: '20100070970',
                name: 'Distribuidora Automotriz S.A.C.',
                contactName: 'Carlos Ramirez',
                phone: null,
                email: null,
                isActive: true,
            });
        });

        it('debe lanzar ConflictException si el RUC ya existe', async () => {
            vi.mocked(repository.findByRuc!).mockResolvedValue(mockSupplier);

            await expect(
                service.create({
                    ruc: '20100070970',
                    name: 'Distribuidora Duplicada',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        it('debe actualizar los datos si el proveedor existe y no hay colision de RUC', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockSupplier);
            vi.mocked(repository.update!).mockResolvedValue({
                ...mockSupplier,
                phone: '999888777',
            });

            const result = await service.update(mockSupplier.id, { phone: '999888777' });

            expect(result.phone).toBe('999888777');
            expect(repository.update).toHaveBeenCalledWith(mockSupplier.id, {
                ruc: undefined,
                name: undefined,
                contactName: undefined,
                phone: '999888777',
                email: undefined,
            });
        });

        it('debe lanzar NotFoundException si el proveedor no existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(null);

            await expect(
                service.update('non-existent-id', { name: 'Update Test' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('debe lanzar ConflictException si se actualiza a un RUC que ya pertenece a otro proveedor', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockSupplier);
            vi.mocked(repository.findByRuc!).mockResolvedValue({
                ...mockSupplier,
                id: 'different-uuid-999',
                ruc: '20555555551',
            });

            await expect(
                service.update(mockSupplier.id, { ruc: '20555555551' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('findById', () => {
        it('debe retornar el proveedor si existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockSupplier);

            const result = await service.findById(mockSupplier.id);

            expect(result).toEqual(mockSupplier);
        });

        it('debe lanzar NotFoundException si el ID no existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(null);

            await expect(service.findById('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAll', () => {
        it('debe retornar la lista de proveedores', async () => {
            vi.mocked(repository.findAll!).mockResolvedValue([mockSupplier]);

            const result = await service.findAll();

            expect(result).toEqual([mockSupplier]);
            expect(repository.findAll).toHaveBeenCalledTimes(1);
        });
    });
});