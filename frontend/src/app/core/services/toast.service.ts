//src/app/core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info';
    text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<ToastMessage[]>([]);

    show(text: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000): void {
        const id = Date.now();
        this.toasts.update((current) => [...current, { id, type, text }]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    remove(id: number): void {
        this.toasts.update((current) => current.filter((t) => t.id !== id));
    }
}