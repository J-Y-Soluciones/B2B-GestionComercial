import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProformaApiDto } from '../approvals-list.component';

@Component({
  selector: 'app-approvals-detail-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4 lg:sticky lg:top-4">
      @if (proforma(); as p) {
        <!-- Header del Panel -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono font-black text-slate-900 text-sm sm:text-base">{{ p.code }}</span>
              <span class="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                Requiere T3
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono mt-0.5">Vence: {{ p.expiresAt | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>

          <button 
            type="button"
            (click)="downloadPdf.emit()" 
            class="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar comprobante en PDF">
            <span>📄</span> PDF
          </button>
        </div>

        <!-- Ficha del Cliente -->
        <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Ficha del Cliente</span>
          <div class="font-bold text-slate-900 leading-tight">{{ p.customer.name }}</div>
          <div class="text-slate-600 text-[11px] font-mono">
            Doc: {{ p.customer.documentNumber }} &bull; Tel: {{ p.customer.phone || 'No registrado' }}
          </div>
          @if (p.customer.address) {
            <div class="text-slate-500 text-[10px] truncate">Dir: {{ p.customer.address }}</div>
          }
        </div>

        <!-- Desglose de Repuestos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Repuestos Cotizados ({{ p.details?.length || 0 }} ítems)</span>
            <span class="text-[10px] font-mono text-slate-400">PEN (S/)</span>
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            @for (d of p.details; track d.id) {
              <div class="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-mono text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">{{ d.product.internalCode }}</span>
                    <span class="text-[9px] font-mono bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                      Tier {{ d.priceTier }}
                    </span>
                  </div>
                  <div class="font-bold text-slate-900 mt-1 leading-snug truncate">{{ d.product.name }}</div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                    {{ d.quantity }} un &times; S/ {{ parseAmount(d.unitPrice) | number:'1.2-2' }} &bull; {{ d.product.brand }}
                  </div>
                </div>
                <div class="text-right font-mono font-black text-slate-900 shrink-0">
                  S/ {{ parseAmount(d.subtotal) | number:'1.2-2' }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Resumen Financiero -->
        <div class="border-t border-slate-200 pt-3 space-y-1 text-xs font-mono">
          <div class="flex justify-between text-slate-500">
            <span>Subtotal Neto:</span>
            <span class="text-slate-800">S/ {{ (parseAmount(p.totalAmount) / 1.18) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>IGV (18%):</span>
            <span class="text-slate-800">S/ {{ (parseAmount(p.totalAmount) - (parseAmount(p.totalAmount) / 1.18)) | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between font-bold text-slate-900 text-sm pt-1.5 border-t border-slate-100">
            <span>Total Cotizado:</span>
            <span class="font-mono text-emerald-800 text-base font-black">S/ {{ parseAmount(p.totalAmount) | number:'1.2-2' }}</span>
          </div>
        </div>

        @if (p.statusLogs?.[0]?.reason) {
          <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 text-[11px]">
            <span class="font-bold text-amber-900 block mb-0.5 font-mono text-[9px] uppercase">Sustento del Asesor:</span>
            <p class="text-amber-800 italic">"{{ p.statusLogs![0].reason }}"</p>
          </div>
        }

        <!-- Botones de Decisión Gerencial -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button 
            type="button"
            (click)="approve.emit()"
            [disabled]="actionLoading()"
            class="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span>✓</span>
            <span>Aprobar</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-200 px-1 rounded">F8</kbd>
          </button>
          <button 
            type="button"
            (click)="reject.emit()"
            [disabled]="actionLoading()"
            class="w-full bg-white hover:bg-rose-50 text-rose-700 font-bold py-2.5 px-3 rounded-xl text-xs border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs">
            <span>✕</span>
            <span>Rechazar</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-rose-100 text-rose-800 px-1 rounded">F9</kbd>
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