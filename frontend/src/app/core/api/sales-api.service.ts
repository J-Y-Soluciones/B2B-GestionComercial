import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Sale, CreateSalePayload } from '../models/sale.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class SalesApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/sales`;

    createSale(payload: CreateSalePayload): Observable<Sale> {
        return this.http.post<Sale>(this.baseUrl, payload);
    }

    getAll(): Observable<Sale[]> {
        return this.http.get<Sale[]>(this.baseUrl);
    }

    getById(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.baseUrl}/${id}`);
    }

    cancelSale(saleId: string, reason: string): Observable<Sale> {
        return this.http.post<Sale>(`${this.baseUrl}/${saleId}/cancel`, { reason });
    }
}