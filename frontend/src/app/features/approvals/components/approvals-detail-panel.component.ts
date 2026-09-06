import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProformaApiDto } from '../approvals-list.component';

@Component({
    selector: 'app-approvals-detail-panel',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
      @if (proforma(); as p) {
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-base">{{ p.code }}</span>
              <span class="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                {{ p.status }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Vence: {{ p.expiresAt | date:'medium' }}</p>
          </div>

          <button 
            type="button"
            (click)="downloadPdf.emit()" 
            class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar comprobante en PDF">
            📄 Descargar PDF
          </button>
        </div>

        <!-- Ficha del Cliente -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ficha del Cliente</span>
          <div class="font-bold text-slate-800">{{ p.customer.name }}</div>
          <div class="text-slate-600 text-[11px]">Doc: {{ p.customer.documentNumber }} • Tel: {{ p.customer.phone || 'No registrado' }}</div>
          <div class="text-slate-500 text-[11px] truncate">Dir: {{ p.customer.address || 'No especificada' }}</div>
        </div>

        <!-- Desglose de Repuestos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Desglose de Repuestos ({{ p.details?.length || 0 }} Ítems)</span>
            <span class="text-[10px] text-slate-400">Moneda: PEN (S/)</span>
          </div>

          <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            @for (d of p.details; track d.id) {
              <div class="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">{{ d.product.internalCode }}</span>
                    <span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">Tier {{ d.priceTier }}</span>
                  </div>
                  <div class="font-semibold text-slate-800 mt-1 leading-snug">{{ d.product.name }}</div>
                  <div class="text-[10px] text-slate-500">Cant: {{ d.quantity }} un (S/ {{ parseAmount(d.unitPrice) | number:'1.2-2' }} c/u) • Marca: {{ d.product.brand }}</div>
                </div>
                <div class="text-right font-mono font-bold text-slate-900">
                  S/ {{ parseAmount(d.subtotal) | number:'1.2-2' }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Importes Calculados -->
        <div class="border-t border-slate-200 pt-3 space-y-1 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Subtotal (Base):</span>
            <span class="font-mono">S/ {{ (parseAmount(p.totalAmount) / 1.18) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>IGV (18%):</span>
            <span class="font-mono">S/ {{ (parseAmount(p.totalAmount) - (parseAmount(p.totalAmount) / 1.18)) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
            <span>Total Final:</span>
            <span class="font-mono text-emerald-700 text-base">S/ {{ parseAmount(p.totalAmount) | number:'1.2-2' }}</span>
          </div>
        </div>

        @if (p.statusLogs?.[0]?.reason) {
          <div class="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 text-[11px]">
            <span class="font-bold text-amber-900 block mb-0.5">Sustento del Asesor:</span>
            <p class="text-amber-800 italic">"{{ p.statusLogs![0].reason }}"</p>
          </div>
        }

        <!-- Botones de Acción -->
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button 
            type="button"
            (click)="approve.emit()"
            [disabled]="actionLoading()"
            class="w-full bg-[#064e3b] hover:bg-emerald-900 text-white font-semibold py-2.5 px-3 rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span>✓</span> Aprobar Proforma [F8]
          </button>
          <button 
            type="button"
            (click)="reject.emit()"
            [disabled]="actionLoading()"
            class="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-2.5 px-3 rounded-lg text-xs border border-red-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span>✕</span> Rechazar Proforma [F9]
          </button>
        </div>
      } @else {
        <div class="py-16 text-center text-slate-400 text-xs">
          Selecciona una proforma de la lista para inspeccionar.
        </div>
      }
    </div>
  `
})
export class ApprovalsDetailPanelComponent {
    proforma = input<ProformaApiDto | null>(null);
    actionLoading = input<boolean>(false);

    approve = output<void>();
    reject = output<void>();
    downloadPdf = output<void>();

    parseAmount(val: number | string | null | undefined): number {
        return Number(val) || 0;
    }
}