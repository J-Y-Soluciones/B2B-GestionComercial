import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
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
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity" (click)="close.emit()"></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <!-- Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditoría Transaccional</span>
                <div class="flex items-center gap-2 mt-0.5">
                  <h2 class="text-base font-black text-slate-900 font-mono">{{ s.code }}</h2>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full"
                        [ngClass]="s.invoice?.status === 'ANULLED' || s.notes?.includes('[ANULADA]') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'">
                    {{ s.invoice?.status === 'ANULLED' || s.notes?.includes('[ANULADA]') ? 'ANULADA' : (s.invoice?.fullCode || 'COMPROBANTE') }}
                  </span>
                </div>
              </div>
              <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">✕</button>
            </div>

            <!-- Body con Scroll -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <!-- Resumen Cliente -->
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-500">Cliente / Razón Social:</span>
                  <span class="font-bold text-slate-900">{{ s.customer?.name || 'Cliente Mostrador' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Documento (RUC/DNI):</span>
                  <span class="font-mono text-slate-700">{{ s.customer?.documentNumber || 'Sin documento' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Monto Liquidado:</span>
                  <span class="font-mono font-black text-slate-900">S/ {{ s.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Detalle de Repuestos Comprados -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Repuestos Adquiridos</span>
                  <span class="font-mono text-[11px] font-semibold text-slate-400">{{ s.details.length }} ítems</span>
                </div>

                <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  @for (item of s.details; track $index) {
                    <div class="p-3 hover:bg-slate-50/60 transition-colors space-y-1">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <span class="font-bold text-slate-900 block leading-tight">{{ item.product?.name || 'Repuesto' }}</span>
                          <span class="text-[10px] font-mono text-slate-400">SKU: {{ item.product?.internalCode || 'N/A' }} · {{ item.product?.brand || 'OEM' }}</span>
                        </div>
                        <span class="font-mono font-bold text-slate-900 whitespace-nowrap">S/ {{ item.subtotal | number:'1.2-2' }}</span>
                      </div>

                      <div class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <div class="flex items-center gap-1.5">
                          <span class="font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{{ item.quantity }} und</span>
                          <span>× S/ {{ item.unitPrice | number:'1.2-2' }}</span>
                          <span class="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded font-bold">T{{ item.priceTier }}</span>
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
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Firma Digital & Hash (CPE)</span>
                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 break-all select-all">
                  {{ s.invoice?.cdrHash || 'HASH-PENDIENTE-SINCRONIZACION' }}
                </div>
              </div>

              <!-- Notas y Auditoría (Si fue anulada o tiene motivos) -->
              @if (s.notes) {
                <div class="space-y-1">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observaciones / Auditoría</span>
                  <div class="p-2.5 rounded-lg border text-xs"
                       [ngClass]="s.notes.includes('[ANULADA]') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'">
                    {{ s.notes }}
                  </div>
                </div>
              }

              <!-- Línea de Vida Transaccional -->
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Línea de Vida Transaccional</span>
                <div class="border-l-2 border-slate-200 pl-3 space-y-4 font-sans text-xs">
                  <div>
                    <span class="text-[10px] font-mono text-slate-400">{{ s.createdAt | date:'HH:mm:ss' }}</span>
                    <p class="font-bold text-slate-800">Liquidación & Comprobante</p>
                    <p class="text-slate-500 text-[11px]">Comprobante {{ s.invoice?.fullCode || 'Interno' }} registrado en caja.</p>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800">Descargo en Kardex</p>
                    <p class="text-slate-500 text-[11px]">Stock descontado físicamente para {{ s.details.length }} repuestos.</p>
                  </div>
                  @if (s.proformaId) {
                    <div>
                      <p class="font-bold text-slate-800">Proforma Vinculada</p>
                      <p class="text-slate-500 text-[11px]">Estado actualizado a CONVERTED.</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50">
              <button (click)="close.emit()"
                      class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer">
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
}