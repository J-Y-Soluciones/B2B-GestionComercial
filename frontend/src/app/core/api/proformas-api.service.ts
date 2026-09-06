// frontend/src/app/core/services/proformas-api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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