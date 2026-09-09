// frontend/src/app/core/services/products-api.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { Product, ProductSearchFilters } from '../models/product.model';

@Injectable({
    providedIn: 'root',
})
export class ProductsApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000/products';

    readonly isSearching = signal<boolean>(false);
    readonly searchResults = signal<Product[]>([]);

    search(filters: ProductSearchFilters): Observable<Product[]> {
        this.isSearching.set(true);
        let params = new HttpParams();

        if (filters.query?.trim()) params = params.set('query', filters.query.trim());
        if (filters.category?.trim() && filters.category !== 'Todas' && filters.category !== 'Todas las Líneas') {
            params = params.set('category', filters.category.trim());
        }
        if (filters.brand?.trim()) params = params.set('brand', filters.brand.trim());
        if (filters.inStock !== undefined) params = params.set('inStock', filters.inStock.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<Product[]>(`${this.baseUrl}/search`, { params }).pipe(
            tap({
                next: (results) => {
                    this.searchResults.set(results);
                    this.isSearching.set(false);
                },
                error: () => this.isSearching.set(false),
            }),
        );
    }

    findByCode(code: string): Observable<Product> {
        return this.http.get<Product>(`${this.baseUrl}/by-code/${code}`);
    }

    findById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.baseUrl}/${id}`);
    }

    setSupplierStock(productId: string, payload: { supplierId: string; supplierSku?: string | null; stock: number; costPrice: number }): Observable<Product> {
        return this.http.put<Product>(`${this.baseUrl}/${productId}/stock`, payload);
    }

    create(payload: any): Observable<Product> {
        return this.http.post<Product>(this.baseUrl, payload);
    }

    update(id: string, payload: any): Observable<Product> {
        return this.http.patch<Product>(`${this.baseUrl}/${id}`, payload);
    }
}