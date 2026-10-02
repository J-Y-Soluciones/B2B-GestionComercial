import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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
    private readonly baseUrl = `${environment.apiUrl}/suppliers`;

    getAll(): Observable<SupplierItem[]> {
        return this.http.get<SupplierItem[]>(this.baseUrl);
    }
}