// frontend/src/app/core/services/customers-api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { Customer, CreateCustomerPayload } from '../models/customer.model';

@Injectable({
    providedIn: 'root',
})
export class CustomersApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/customers';

    readonly selectedCustomer = signal<Customer | null>(null);
    readonly isSearching = signal<boolean>(false);

    search(query: string, limit = 10): Observable<Customer[]> {
        this.isSearching.set(true);
        const params = new HttpParams()
            .set('query', query.trim())
            .set('limit', limit.toString());

        return this.http.get<Customer[]>(`${this.baseUrl}/search`, { params }).pipe(
            tap({
                next: () => this.isSearching.set(false),
                error: () => this.isSearching.set(false),
            }),
        );
    }

    findByDocumentNumber(documentNumber: string): Observable<Customer> {
        return this.http.get<Customer>(`${this.baseUrl}/by-document/${documentNumber}`);
    }

    create(payload: CreateCustomerPayload): Observable<Customer> {
        return this.http.post<Customer>(this.baseUrl, payload).pipe(
            tap((customer) => this.selectedCustomer.set(customer)),
        );
    }

    selectCustomer(customer: Customer | null): void {
        this.selectedCustomer.set(customer);
    }
}