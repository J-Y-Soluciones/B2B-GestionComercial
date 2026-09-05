// backend/src/modules/customers/application/services/customers.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerService } from './customers.service.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CustomerEntity } from '../../domain/entities/customer.entity.js';
import { CustomerType } from '@prisma/client';

describe('CustomerService', () => {
    let service: CustomerService;
    let repository: Partial<ICustomerRepository>;

    const mockCustomer = new CustomerEntity({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        type: CustomerType.NATURAL,
        documentNumber: '72345678',
        name: 'Juan Perez',
        email: 'juan@cliente.pe',
        phone: '987654321',
        address: 'Av. Las Palmeras 123',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    beforeEach(() => {
        repository = {
            findById: vi.fn(),
            findByDocumentNumber: vi.fn(),
            search: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        };
        service = new CustomerService(repository as ICustomerRepository);
    });

    describe('findById', () => {
        it('debe retornar el cliente cuando existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockCustomer);

            const result = await service.findById(mockCustomer.id);

            expect(result).toEqual(mockCustomer);
            expect(repository.findById).toHaveBeenCalledWith(mockCustomer.id);
        });

        it('debe lanzar NotFoundException si el cliente no existe', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(null);

            await expect(service.findById('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findByDocumentNumber', () => {
        it('debe retornar el cliente si coincide el documento', async () => {
            vi.mocked(repository.findByDocumentNumber!).mockResolvedValue(mockCustomer);

            const result = await service.findByDocumentNumber('72345678');

            expect(result).toEqual(mockCustomer);
            expect(repository.findByDocumentNumber).toHaveBeenCalledWith('72345678');
        });

        it('debe lanzar NotFoundException si el documento no existe', async () => {
            vi.mocked(repository.findByDocumentNumber!).mockResolvedValue(null);

            await expect(service.findByDocumentNumber('00000000')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('search', () => {
        it('debe retornar un array vacio si el término viene vacio o con solo espacios', async () => {
            const result = await service.search('   ');

            expect(result).toEqual([]);
            expect(repository.search).not.toHaveBeenCalled();
        });

        it('debe ejecutar la busqueda sanitizando espacios al inicio y final', async () => {
            vi.mocked(repository.search!).mockResolvedValue([mockCustomer]);

            const result = await service.search('  Juan  ', 5);

            expect(result).toEqual([mockCustomer]);
            expect(repository.search).toHaveBeenCalledWith('Juan', 5);
        });
    });

    describe('create', () => {
        it('debe registrar el cliente exitosamente', async () => {
            vi.mocked(repository.findByDocumentNumber!).mockResolvedValue(null);
            vi.mocked(repository.create!).mockResolvedValue(mockCustomer);

            const dto = {
                type: CustomerType.NATURAL,
                documentNumber: '72345678',
                name: 'Juan Perez',
                email: 'juan@cliente.pe',
            };

            const result = await service.create(dto);

            expect(result).toEqual(mockCustomer);
            expect(repository.create).toHaveBeenCalledWith({
                type: CustomerType.NATURAL,
                documentNumber: '72345678',
                name: 'Juan Perez',
                email: 'juan@cliente.pe',
                phone: null,
                address: null,
            });
        });

        it('debe lanzar ConflictException si el documento ya se encuentra registrado', async () => {
            vi.mocked(repository.findByDocumentNumber!).mockResolvedValue(mockCustomer);

            await expect(
                service.create({
                    type: CustomerType.NATURAL,
                    documentNumber: '72345678',
                    name: 'Otro Juan',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        it('debe actualizar el cliente correctamente si no cambia el documento', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockCustomer);
            vi.mocked(repository.update!).mockResolvedValue({
                ...mockCustomer,
                name: 'Juan Modificado',
            });

            const result = await service.update(mockCustomer.id, { name: 'Juan Modificado' });

            expect(result.name).toBe('Juan Modificado');
            expect(repository.update).toHaveBeenCalledWith(mockCustomer.id, {
                name: 'Juan Modificado',
            });
        });

        it('debe lanzar ConflictException si intenta cambiar el documento por uno existente en otro cliente', async () => {
            vi.mocked(repository.findById!).mockResolvedValue(mockCustomer);
            vi.mocked(repository.findByDocumentNumber!).mockResolvedValue(
                new CustomerEntity({ id: 'different-uuid', documentNumber: '11223344' }),
            );

            await expect(
                service.update(mockCustomer.id, { documentNumber: '11223344' }),
            ).rejects.toThrow(ConflictException);
        });
    });
});