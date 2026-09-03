// src/modules/customers/application/services/customers.service.ts
import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { CreateCustomerDto } from '../dtos/create-customer.dto.js';
import { SearchCustomerDto } from '../dtos/search-customer.dto.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';

@Injectable()
export class CustomersService {
    constructor(
        @Inject(CUSTOMER_REPOSITORY)
        private readonly customerRepository: ICustomerRepository,
    ) { }

    async create(dto: CreateCustomerDto) {
        const existing = await this.customerRepository.findByDocument(dto.documentNumber);

        if (existing) {
            throw new ConflictException('Ya existe un cliente con este documento');
        }

        return this.customerRepository.create(dto);
    }

    async search(dto: SearchCustomerDto) {
        return this.customerRepository.search(dto.query ?? '');
    }
}