import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sales-audit-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sale(); as s) {
      <div class="fixed inset-0 z-50 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="close.emit()"></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div class="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <!-- Header Fijo -->
            <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Auditoría Transaccional</span>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <h2 class="text-sm sm:text-base font-black text-slate-900 font-mono">{{ s.code }}</h2>
                  
                  @if (s.invoice?.status === 'ANULLED' || s.notes?.includes('[ANULADA]')) {
                    <span class="px-2 py-0.2 text-[9px] font-mono font-bold rounded-full bg-rose-100 text-rose-800 uppercase">
                      ANULADA
                    </span>
                  } @else if (isInternalSale()) {
                    <span class="px-2 py-0.2 text-[9px] font-mono font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {{ s.invoice?.fullCode || 'NV01-INT' }}
                    </span>
                  } @else {
                    <span class="px-2 py-0.2 text-[9px] font-mono font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {{ s.invoice?.fullCode || 'COMPROBANTE' }}
                    </span>
                  }
                </div>
              </div>
              <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-base font-bold">&times;</button>
            </div>

            <!-- Body Scrolleable -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              <!-- Resumen Cliente -->
              <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div class="flex justify-between">
                  <span class="text-slate-500">Cliente / Razón Social:</span>
                  <span class="font-bold text-slate-900 truncate max-w-[200px]">{{ s.customer?.name || 'Cliente Mostrador' }}</span>
                </div>
                <div class="flex justify-between font-mono text-[11px]">
                  <span class="text-slate-500">Doc Fiscal:</span>
                  <span class="text-slate-800 font-semibold">{{ s.customer?.documentNumber || 'Sin documento' }}</span>
                </div>
                <div class="flex justify-between font-mono pt-1 border-t border-slate-200/60">
                  <span class="text-slate-500">Monto Liquidado:</span>
                  <span class="font-black text-slate-900">S/ {{ s.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Detalle de Repuestos -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Repuestos Adquiridos</span>
                  <span class="font-mono text-[10px] font-bold text-slate-500">{{ s.details.length }} ítems</span>
                </div>

                <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  @for (item of s.details; track $index) {
                    <div class="p-3 hover:bg-slate-50/60 transition-colors space-y-1">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <span class="font-bold text-slate-900 block leading-tight truncate">{{ item.product?.name || 'Repuesto' }}</span>
                          <span class="text-[10px] font-mono text-slate-400">SKU: {{ item.product?.internalCode || 'N/A' }} &bull; {{ item.product?.brand || 'OEM' }}</span>
                        </div>
                        <span class="font-mono font-bold text-slate-900 whitespace-nowrap">S/ {{ item.subtotal | number:'1.2-2' }}</span>
                      </div>

                      <div class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <div class="flex items-center gap-1.5 font-mono">
                          <span class="bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-700">{{ item.quantity }} un</span>
                          <span>&times; S/ {{ item.unitPrice | number:'1.2-2' }}</span>
                          <span class="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 rounded font-bold">T{{ item.priceTier }}</span>
                        </div>
                        @if (item.costPrice) {
                          <span class="text-[10px] text-slate-400 font-mono">Costo: S/ {{ item.costPrice | number:'1.2-2' }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Firma Digital / Hash -->
              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Firma Digital &amp; Hash (CPE)</span>
                @if (isInternalSale()) {
                  <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-400 italic">
                    Modo Interno (Operación no enviada a SUNAT)
                  </div>
                } @else {
                  <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600 break-all select-all">
                    {{ s.invoice?.cdrHash || 'HASH-PENDIENTE-SINCRONIZACION' }}
                  </div>
                }
              </div>

              <!-- Observaciones -->
              @if (s.notes) {
                <div class="space-y-1">
                  <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Observaciones / Auditoría</span>
                  <div class="p-2.5 rounded-xl border text-xs leading-relaxed"
                       [ngClass]="s.notes.includes('[ANULADA]') ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700'">
                    {{ s.notes }}
                  </div>
                </div>
              }

              <!-- Trazabilidad / Timeline -->
              <div class="space-y-2 pt-1">
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Línea de Vida Transaccional</span>
                <div class="border-l-2 border-slate-200 pl-3 space-y-3 font-sans text-xs">
                  <div>
                    <span class="text-[10px] font-mono text-slate-400">{{ s.createdAt | date:'HH:mm:ss' }}</span>
                    <p class="font-bold text-slate-900">Emisión de Comprobante</p>
                    <p class="text-slate-500 text-[11px]">
                      {{ isInternalSale() ? 'Ticket Interno NV01 emitido.' : 'Comprobante ' + (s.invoice?.fullCode || '') + ' emitido.' }}
                    </p>
                  </div>
                  <div>
                    <p class="font-bold text-slate-900">Descargo en Almacén</p>
                    <p class="text-slate-500 text-[11px]">Inventario actualizado para {{ s.details.length }} repuestos.</p>
                  </div>
                  @if (s.proformaId) {
                    <div>
                      <p class="font-bold text-slate-900">Proforma Vinculada</p>
                      <p class="text-slate-500 text-[11px]">Cotización original convertida en venta final.</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Footer Fijo -->
            <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <button (click)="close.emit()"
                      class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer">
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SalesAuditDrawerComponent {
  sale = input<Sale | null>(null);
  close = output<void>();

  isInternalSale = computed(() => {
    const s = this.sale();
    if (!s || !s.invoice) return false;
    const status = s.invoice.status as string;
    return s.invoice.series === 'NV01' || status === 'INTERNAL' || s.invoice.type === 'NOTA_VENTA';
  });
}