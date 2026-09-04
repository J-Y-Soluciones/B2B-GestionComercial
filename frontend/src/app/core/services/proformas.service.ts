// frontend/src/app/core/services/proformas.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
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

    // Obtener todas las proformas (o filtrar por status)
    getProformas(status?: string): Observable<ProformaDto[]> {
        const url = status ? `${this.API_URL}?status=${status}` : this.API_URL;
        return this.http.get<ProformaDto[]>(url);
    }

    // Aprobar proforma Tier 3
    approveProforma(id: string): Observable<ProformaDto> {
        return this.http.patch<ProformaDto>(`${this.API_URL}/${id}/approve`, {});
    }

    // Rechazar proforma con motivo
    rejectProforma(id: string, reason: string): Observable<ProformaDto> {
        return this.http.patch<ProformaDto>(`${this.API_URL}/${id}/reject`, { reason });
    }
}