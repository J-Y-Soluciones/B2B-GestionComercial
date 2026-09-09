import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type {
    Proforma,
    CreateProformaPayload,
} from '../models/proforma.model';

@Injectable({
    providedIn: 'root',
})
export class ProformasApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/proformas';

    readonly isSubmitting = signal<boolean>(false);
    readonly lastCreatedProforma = signal<Proforma | null>(null);

    getAll(filters?: { customerId?: string; sellerId?: string; status?: string }): Observable<Proforma[]> {
        let params = new HttpParams();
        if (filters?.customerId) params = params.set('customerId', filters.customerId);
        if (filters?.sellerId) params = params.set('sellerId', filters.sellerId);
        if (filters?.status && filters.status !== 'ALL') params = params.set('status', filters.status);

        return this.http.get<Proforma[]>(this.baseUrl, { params });
    }

    create(payload: CreateProformaPayload): Observable<Proforma> {
        this.isSubmitting.set(true);
        return this.http.post<Proforma>(this.baseUrl, payload).pipe(
            tap({
                next: (proforma) => {
                    this.lastCreatedProforma.set(proforma);
                    this.isSubmitting.set(false);
                },
                error: () => this.isSubmitting.set(false),
            }),
        );
    }

    getById(id: string): Observable<Proforma> {
        return this.http.get<Proforma>(`${this.baseUrl}/${id}`);
    }

    downloadPdf(id: string, fileName: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/${id}/pdf`, {
            responseType: 'blob',
        }).pipe(
            tap((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            }),
        );
    }
}