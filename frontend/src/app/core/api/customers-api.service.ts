//src/app/core/api/customers-api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { Customer, CreateCustomerPayload } from '../models/customer.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
    providedIn: 'root',
})
export class CustomersApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/customers`;

    readonly selectedCustomer = signal<Customer | null>(null);
    readonly isSearching = signal<boolean>(false);

    search(query: string = '', limit = 10): Observable<Customer[]> {
        this.isSearching.set(true);

        let params = new HttpParams().set('limit', limit.toString());

        const cleanQuery = query ? query.trim() : '';
        if (cleanQuery) {
            params = params.set('query', cleanQuery);
        }

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

    update(id: string, payload: Partial<CreateCustomerPayload>): Observable<Customer> {
        return this.http.patch<Customer>(`${this.baseUrl}/${id}`, payload).pipe(
            tap((customer) => {
                if (this.selectedCustomer()?.id === id) {
                    this.selectedCustomer.set(customer);
                }
            }),
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    selectCustomer(customer: Customer | null): void {
        this.selectedCustomer.set(customer);
    }
}