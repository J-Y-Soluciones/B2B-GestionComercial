import { IsString, IsNotEmpty } from 'class-validator';

export class SearchCustomerDto {
    @IsString()
    @IsNotEmpty()
    query!: string;
}