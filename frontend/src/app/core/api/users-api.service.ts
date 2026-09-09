import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserItem {
    id: string;
    email: string;
    name?: string;
    role: 'ADMIN' | 'MANAGER' | 'SELLER' | 'WAREHOUSE';
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    profile?: {
        fullName?: string;
        branch?: string;
    } | null;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/users`;

    getAll(): Observable<UserItem[]> {
        return this.http.get<UserItem[]>(this.baseUrl);
    }

    create(payload: { email: string; name?: string; role: string }): Observable<UserItem> {
        return this.http.post<UserItem>(this.baseUrl, payload);
    }

    update(id: string, payload: { email?: string; name?: string; role?: string; isActive?: boolean }): Observable<UserItem> {
        return this.http.patch<UserItem>(`${this.baseUrl}/${id}`, payload);
    }

    toggleStatus(id: string): Observable<UserItem> {
        return this.http.patch<UserItem>(`${this.baseUrl}/${id}/toggle-status`, {});
    }

    sendResetPassword(id: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/send-reset-password`, {});
    }
}