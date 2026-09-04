// backend/src/modules/proformas/application/services/proforma-pdf.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface ProformaPdfData {
    code: string;
    createdAt: Date;
    expiresAt: Date;
    customer: {
        name: string;
        documentNumber: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
    };
    seller: {
        email: string;
    };
    details: {
        productName: string;
        internalCode: string;
        quantity: number;
        unitPrice: number;
        priceTier: number;
        subtotal: number;
    }[];
    totalAmount: number;
}

@Injectable()
export class ProformaPdfService {
    async generate(data: ProformaPdfData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const buffers: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err: Error) => reject(err));

            // --- PALETA CORPORATIVA ---
            const primaryColor = '#065F46'; // Forest Green
            const darkText = '#1F2937';
            const mutedText = '#6B7280';
            const borderLine = '#E5E7EB';

            // --- HEADER COMERCIAL ---
            doc.rect(40, 40, 6, 45).fill(primaryColor);

            doc
                .fontSize(18)
                .fillColor(primaryColor)
                .text('SISTEMA DE REPUESTOS AUTOMOTRICES', 55, 42, { bold: true } as PDFKit.Mixins.TextOptions);

            doc
                .fontSize(9)
                .fillColor(mutedText)
                .text('Gestión Comercial, Inventario y Distribución', 55, 62)
                .text('Comprobante Informativo - No Válido como Comprobante de Pago', 55, 74);

            // --- BLOQUE PROFORMA & FECHAS (Derecha) ---
            doc
                .fontSize(14)
                .fillColor(darkText)
                .text(data.code, 350, 42, { align: 'right', bold: true } as PDFKit.Mixins.TextOptions);

            doc
                .fontSize(8)
                .fillColor(mutedText)
                .text(`Emisión: ${new Date(data.createdAt).toLocaleDateString('es-PE')}`, 350, 60, { align: 'right' })
                .text(`Válido hasta: ${new Date(data.expiresAt).toLocaleDateString('es-PE')}`, 350, 72, { align: 'right' })
                .text(`Vendedor: ${data.seller.email}`, 350, 84, { align: 'right' });

            doc.moveTo(40, 105).lineTo(555, 105).strokeColor(borderLine).stroke();

            // --- DATOS DEL CLIENTE ---
            const customerY = 115;
            doc
                .fontSize(10)
                .fillColor(primaryColor)
                .text('DATOS DEL CLIENTE', 40, customerY, { bold: true } as PDFKit.Mixins.TextOptions);

            doc
                .fontSize(9)
                .fillColor(darkText)
                .text(`Cliente: ${data.customer.name}`, 40, customerY + 16)
                .text(`Documento (RUC/DNI): ${data.customer.documentNumber}`, 40, customerY + 28);

            if (data.customer.phone || data.customer.email) {
                const contactInfo = [data.customer.phone, data.customer.email].filter(Boolean).join(' | ');
                doc.text(`Contacto: ${contactInfo}`, 40, customerY + 40);
            }

            // --- TABLA DE ITEMS ---
            const tableTop = 185;
            doc.rect(40, tableTop, 515, 22).fill('#F3F4F6');

            doc
                .fontSize(8)
                .fillColor(primaryColor)
                .text('CÓDIGO', 45, tableTop + 6, { bold: true } as PDFKit.Mixins.TextOptions)
                .text('DESCRIPCIÓN / REPUESTO', 120, tableTop + 6, { bold: true } as PDFKit.Mixins.TextOptions)
                .text('CANT.', 330, tableTop + 6, { align: 'center', width: 40, bold: true } as PDFKit.Mixins.TextOptions)
                .text('NIVEL', 375, tableTop + 6, { align: 'center', width: 40, bold: true } as PDFKit.Mixins.TextOptions)
                .text('P. UNIT (S/)', 420, tableTop + 6, { align: 'right', width: 60, bold: true } as PDFKit.Mixins.TextOptions)
                .text('TOTAL (S/)', 485, tableTop + 6, { align: 'right', width: 65, bold: true } as PDFKit.Mixins.TextOptions);

            let currentY = tableTop + 26;
            doc.fillColor(darkText);

            data.details.forEach((item) => {
                doc
                    .fontSize(8)
                    .text(item.internalCode, 45, currentY)
                    .text(item.productName, 120, currentY, { width: 205, ellipsis: true })
                    .text(item.quantity.toString(), 330, currentY, { align: 'center', width: 40 })
                    .text(`T${item.priceTier}`, 375, currentY, { align: 'center', width: 40 })
                    .text(item.unitPrice.toFixed(2), 420, currentY, { align: 'right', width: 60 })
                    .text(item.subtotal.toFixed(2), 485, currentY, { align: 'right', width: 65 });

                currentY += 20;
                doc.moveTo(40, currentY - 4).lineTo(555, currentY - 4).strokeColor(borderLine).stroke();
            });

            // --- TOTALES ---
            const totalsY = currentY + 15;
            doc.rect(360, totalsY, 195, 40).fill('#ECFDF5');

            doc
                .fontSize(10)
                .fillColor(primaryColor)
                .text('TOTAL COTIZADO:', 375, totalsY + 14, { bold: true } as PDFKit.Mixins.TextOptions)
                .fontSize(13)
                .text(`S/ ${data.totalAmount.toFixed(2)}`, 450, totalsY + 12, { align: 'right', width: 95, bold: true } as PDFKit.Mixins.TextOptions);

            // --- PIE TÉCNICO (Anti-Generic / VortexYolTI Rules) ---
            doc
                .fontSize(7)
                .fillColor(mutedText)
                .text(
                    'Precios y disponibilidad sujetos a confirmación de stock al momento de convertir a venta. Validez: 48 horas.',
                    40,
                    770,
                    { align: 'center', width: 515 }
                )
                .text('Desarrollado por VortexYolTI • Sistema Transaccional Enterprise', 40, 782, {
                    align: 'center',
                    width: 515,
                });

            doc.end();
        });
    }
}