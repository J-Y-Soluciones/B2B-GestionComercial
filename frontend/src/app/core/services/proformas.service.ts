import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProformaDetailDto {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    priceTier: number;
    subtotal: number;
    product?: {
        id: string;
        internalCode: string;
        name: string;
        brand: string;
    };
}

export interface ProformaDto {
    id: string;
    code: string;
    status: 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
    totalAmount: number;
    createdAt: string;
    expiresAt: string;
    seller?: {
        id: string;
        email: string;
        role: string;
    };
    customer?: {
        id: string;
        name: string;
        documentNumber: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    details: ProformaDetailDto[];
}

@Injectable({ providedIn: 'root' })
export class ProformasService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/proformas`;

    readonly pendingApprovalsCount = signal<number>(0);

    getProformas(status?: string): Observable<ProformaDto[]> {
        const url = status ? `${this.API_URL}?status=${status}` : this.API_URL;
        return this.http.get<ProformaDto[]>(url).pipe(
            tap((data) => {
                if (status === 'PENDING_APPROVAL') {
                    this.pendingApprovalsCount.set(data.length);
                }
            })
        );
    }

    getById(id: string): Observable<ProformaDto> {
        return this.http.get<ProformaDto>(`${this.API_URL}/${id}`);
    }

    cancelProforma(id: string, reason = 'Desistimiento de compra en mostrador'): Observable<ProformaDto> {
        return this.http.patch<ProformaDto>(`${this.API_URL}/${id}/reject`, { reason });
    }

    refreshPendingCount(): void {
        this.getProformas('PENDING_APPROVAL').subscribe({
            next: (data) => this.pendingApprovalsCount.set(data.length),
            error: () => this.pendingApprovalsCount.set(0)
        });
    }

    approveProforma(id: string): Observable<ProformaDto> {
        return this.http.patch<ProformaDto>(`${this.API_URL}/${id}/approve`, {}).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    rejectProforma(id: string, reason: string): Observable<ProformaDto> {
        return this.http.patch<ProformaDto>(`${this.API_URL}/${id}/reject`, { reason }).pipe(
            tap(() => this.refreshPendingCount())
        );
    }

    downloadPdf(id: string, code: string): void {
        this.http.get(`${this.API_URL}/${id}/pdf`, { responseType: 'blob' }).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `${code}.pdf`;
                anchor.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Error descargando PDF:', err);
            }
        });
    }
}