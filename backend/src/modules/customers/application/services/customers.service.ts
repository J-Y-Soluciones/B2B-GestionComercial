// backend/src/modules/customers/application/services/customers.service.ts
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  type ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface.js';
import type { CustomerEntity } from '../../domain/entities/customer.entity.js';
import type { CreateCustomerDto } from '../dtos/create-customer.dto.js';
import type { UpdateCustomerDto } from '../dtos/update-customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
  ) { }

  async findById(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return customer;
  }

  async findByDocumentNumber(documentNumber: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findByDocumentNumber(documentNumber);
    if (!customer) {
      throw new NotFoundException(`Cliente con documento ${documentNumber} no encontrado`);
    }
    return customer;
  }

  async search(query: string, limit = 10): Promise<CustomerEntity[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.customerRepository.search(query.trim(), limit);
  }

  async create(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const existing = await this.customerRepository.findByDocumentNumber(dto.documentNumber);
    if (existing) {
      throw new ConflictException(`Ya existe un cliente con el documento ${dto.documentNumber}`);
    }

    return this.customerRepository.create({
      type: dto.type,
      documentNumber: dto.documentNumber,
      name: dto.name,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
    });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    await this.findById(id);

    if (dto.documentNumber) {
      const duplicate = await this.customerRepository.findByDocumentNumber(dto.documentNumber);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `El documento ${dto.documentNumber} ya se encuentra registrado por otro cliente`,
        );
      }
    }

    return this.customerRepository.update(id, {
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.documentNumber !== undefined && { documentNumber: dto.documentNumber }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.address !== undefined && { address: dto.address }),
    });
  }
}