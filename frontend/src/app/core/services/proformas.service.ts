import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface ProformaItemDto {
    id: string;
    partId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    part: {
        sku: string;
        description: string;
        brand: string;
    };
}

export interface ProformaDto {
    id: string;
    code: string;
    status: 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    priceTier: string;
    subtotal: number;
    igv: number;
    totalAmount: number;
    notes?: string;
    rejectionReason?: string;
    createdAt: string;
    seller: {
        email: string;
    };
    customer: {
        id: string;
        legalName: string;
        documentType: string;
        documentNumber: string;
        phone?: string;
        address?: string;
    };
    items: ProformaItemDto[];
}

@Injectable({ providedIn: 'root' })
export class ProformasService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:3000/proformas';

    // Estado reactivo compartido en toda la aplicación
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
                alert('Error al descargar el comprobante en PDF.');
            }
        });
    } 
}