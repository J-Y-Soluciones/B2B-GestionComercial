import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface UserModulePermission {
    moduleCode: string;
    name: string;
    path: string;
    icon: string | null;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface UserProfile {
    id: string;
    name: string;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    profile: UserProfile | null;
    modules: UserModulePermission[];
}

export interface AuthResponse {
    accessToken: string;
    user: AuthenticatedUser;
}

export interface MessageResponse {
    message: string;
}

interface JwtRawPayload {
    sub: string;
    email: string;
    role: string;
    profileId?: string | null;
    exp: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/auth`;

    public currentUser = signal<AuthenticatedUser | null>(null);
    public token = signal<string | null>(null);

    public isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
    public authorizedModules = computed<UserModulePermission[]>(() => this.currentUser()?.modules ?? []);

    constructor() {
        this.loadSessionFromStorage();
    }

    public login(credentials: Record<'email' | 'password', string>): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap((response) => this.handleAuthSuccess(response))
        );
    }

    public forgotPassword(email: string): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.API_URL}/forgot-password`, { email });
    }

    public resetPassword(data: Record<'token' | 'newPassword', string>): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.API_URL}/reset-password`, data);
    }

    public logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        this.token.set(null);
        this.currentUser.set(null);
    }

    private handleAuthSuccess(response: AuthResponse): void {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userData', JSON.stringify(response.user));
        this.token.set(response.accessToken);
        this.currentUser.set(response.user);
    }

    private loadSessionFromStorage(): void {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');

        if (!token || !userData) {
            this.logout();
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) throw new Error('Token inválido');

            const decodedJson = atob(payloadBase64);
            const payload: JwtRawPayload = JSON.parse(decodedJson);

            if (payload.exp * 1000 < Date.now()) {
                this.logout();
                return;
            }

            this.token.set(token);
            this.currentUser.set(JSON.parse(userData));
        } catch {
            this.logout();
        }
    }
}