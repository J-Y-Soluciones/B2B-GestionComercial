import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierItem {
    id: string;
    name: string;
    ruc: string;
    phone?: string;
    address?: string;
}

@Injectable({ providedIn: 'root' })
export class SuppliersApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/suppliers';

    getAll(): Observable<SupplierItem[]> {
        return this.http.get<SupplierItem[]>(this.baseUrl);
    }
}