// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
    accessToken: string;
}

export interface MessageResponse {
    message: string;
}

export interface JwtPayload {
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
    private readonly API_URL = 'http://localhost:3000/auth';

    public currentUser = signal<JwtPayload | null>(null);

    constructor() {
        this.loadTokenFromStorage();
    }

    public login(credentials: Record<'email' | 'password', string>): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap((response) => this.handleAuthSuccess(response.accessToken))
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
        this.currentUser.set(null);
    }

    private handleAuthSuccess(token: string): void {
        localStorage.setItem('accessToken', token);
        this.decodeAndSetUser(token);
    }

    private loadTokenFromStorage(): void {
        const token = localStorage.getItem('accessToken');
        if (token) {
            this.decodeAndSetUser(token);
        }
    }

    private decodeAndSetUser(token: string): void {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedJson = atob(payloadBase64);
            const payload: JwtPayload = JSON.parse(decodedJson);

            if (payload.exp * 1000 < Date.now()) {
                this.logout();
            } else {
                this.currentUser.set(payload);
            }
        } catch (error) {
            console.error('Error decodificando el token JWT', error);
            this.logout();
        }
    }
}