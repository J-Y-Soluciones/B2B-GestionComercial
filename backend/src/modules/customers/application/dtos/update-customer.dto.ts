// src/modules/customers/application/dtos/update-customer.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto.js';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) { }