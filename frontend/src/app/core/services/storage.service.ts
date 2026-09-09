import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }

    /**
     * Convierte y redimensiona cualquier imagen (JPG, PNG) a WebP en el navegador
     */
    private convertToWebP(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar proporcionalmente si excede el ancho máximo
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('No se pudo inicializar el contexto de canvas'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Conversión a formato WebP optimizado
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Fallo al convertir la imagen a WebP'));
                            }
                        },
                        'image/webp',
                        quality
                    );
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    async uploadProductImage(file: File, sku: string): Promise<string> {
        // 1. Convierte a WebP y optimiza resolución (máx 800px de ancho)
        const webpBlob = await this.convertToWebP(file, 800, 0.82);

        // 2. Genera nombre único siempre con extensión .webp
        const cleanSku = (sku || 'prod').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        const fileName = `${cleanSku}-${Date.now()}.webp`;
        const filePath = `catalog/${fileName}`;

        // 3. Sube el Blob WebP a Supabase Storage
        const { error } = await this.supabase.storage
            .from('products-images')
            .upload(filePath, webpBlob, {
                contentType: 'image/webp',
                cacheControl: '31536000', // 1 año de caché en CDN
                upsert: true,
            });

        if (error) {
            throw new Error(`Error en Supabase Storage: ${error.message}`);
        }

        const { data } = this.supabase.storage
            .from('products-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}