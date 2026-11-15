// backend/src/modules/sales/infrastructure/services/nubefact.service.ts
import { Injectable, Logger } from '@nestjs/common';

export interface NubefactEmitPayload {
  invoiceType: 'BOLETA' | 'FACTURA';
  series: string;
  correlative: number;
  customer: {
    documentNumber: string;
    name: string;
    address?: string | null;
    email?: string | null;
  };
  subtotal: number;
  igvAmount: number;
  totalAmount: number;
  items: {
    code: string;
    description: string;
    quantity: number;
    unitPriceWithIgv: number;
    subtotalWithIgv: number;
  }[];
}

export interface NubefactEmitResponse {
  accepted: boolean;
  externalId: string;
  cdrHash: string;
  qrCodeUrl: string;
  pdfUrl?: string;
  errorMessage?: string;
}

@Injectable()
export class NubefactService {
  private readonly logger = new Logger(NubefactService.name);

  async emitComprobante(
    payload: NubefactEmitPayload,
  ): Promise<NubefactEmitResponse> {
    const apiUrl = process.env['NUBEFACT_API_URL']?.trim();
    const apiToken = process.env['NUBEFACT_API_TOKEN']?.trim();

    const fullCode = `${payload.series}-${String(payload.correlative).padStart(7, '0')}`;

    // 1. MODO DEMO / MOCK (Cuando aún no se cargan credenciales en .env)
    if (!apiUrl || !apiToken) {
      this.logger.warn(
        `[NUBEFACT MOCK] Credenciales no configuradas. Simulando emisión exitosa en SUNAT DEMO para ${fullCode} (Total: S/ ${payload.totalAmount.toFixed(2)})`,
      );

      const mockHash = `NBF-DEMO-${Buffer.from(fullCode).toString('base64').slice(0, 12)}-${Date.now().toString().slice(-4)}`;
      return {
        accepted: true,
        externalId: `DEMO-${fullCode}`,
        cdrHash: mockHash,
        qrCodeUrl: `https://demo.nubefact.com/qr/${fullCode}?hash=${mockHash}`,
        pdfUrl: `https://demo.nubefact.com/pdf/${fullCode}.pdf`,
      };
    }

    // 2. CONEXIÓN REAL CON API REST DE NUBEFACT (JSON v1)
    try {
      const tipoComprobante = payload.invoiceType === 'FACTURA' ? 1 : 2;
      const docNum = payload.customer.documentNumber?.trim() || '-';
      const tipoDocCliente =
        docNum.length === 11
          ? 6
          : docNum.length === 8 && docNum !== '00000000'
            ? 1
            : '-';

      const nubefactBody = {
        operacion: 'generar_comprobante',
        tipo_de_comprobante: tipoComprobante,
        serie: payload.series,
        numero: payload.correlative,
        sunat_transaction: 1,
        cliente_tipo_de_documento: tipoDocCliente,
        cliente_numero_de_documento: tipoDocCliente === '-' ? '-' : docNum,
        cliente_denominacion: payload.customer.name,
        cliente_direccion: payload.customer.address || '',
        cliente_email: payload.customer.email || '',
        fecha_de_emision: new Date()
          .toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '-'),
        moneda: 1, // 1 = Soles (PEN)
        porcentaje_de_igv: 18.0,
        total_gravada: payload.subtotal,
        total_igv: payload.igvAmount,
        total: payload.totalAmount,
        enviar_automaticamente_a_la_sunat: true,
        enviar_automaticamente_al_cliente: Boolean(payload.customer.email),
        items: payload.items.map((item) => {
          const valorUnitarioSinIgv = Number(
            (item.unitPriceWithIgv / 1.18).toFixed(4),
          );
          const subtotalSinIgv = Number(
            (item.subtotalWithIgv / 1.18).toFixed(2),
          );
          const igvItem = Number(
            (item.subtotalWithIgv - subtotalSinIgv).toFixed(2),
          );

          return {
            unidad_de_medida: 'NIU',
            codigo: item.code,
            descripcion: item.description,
            cantidad: item.quantity,
            valor_unitario: valorUnitarioSinIgv,
            precio_unitario: item.unitPriceWithIgv,
            subtotal: subtotalSinIgv,
            tipo_de_igv: 1, // Gravado - Operación Onerosa
            igv: igvItem,
            total: item.subtotalWithIgv,
          };
        }),
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token token="${apiToken}"`,
        },
        body: JSON.stringify(nubefactBody),
      });

      const result = await response.json();

      if (!response.ok || result.errors) {
        const errorMsg =
          result.errors || `HTTP ${response.status} al conectar con NubeFact`;
        this.logger.error(`[NUBEFACT ERROR] ${fullCode}: ${errorMsg}`);
        return {
          accepted: false,
          externalId: fullCode,
          cdrHash: '',
          qrCodeUrl: '',
          errorMessage: String(errorMsg),
        };
      }

      return {
        accepted: Boolean(result.aceptada_por_sunat ?? true),
        externalId: result.codigo_unico || fullCode,
        cdrHash: result.codigo_hash || `HASH-${Date.now()}`,
        qrCodeUrl: result.cadena_para_codigo_qr || '',
        pdfUrl: result.enlace_del_pdf || '',
      };
    } catch (error: any) {
      this.logger.error(`[NUBEFACT EXCEPTION] ${fullCode}: ${error.message}`);
      return {
        accepted: false,
        externalId: fullCode,
        cdrHash: '',
        qrCodeUrl: '',
        errorMessage: error.message || 'Error de red comunicando con NubeFact',
      };
    }
  }
}
