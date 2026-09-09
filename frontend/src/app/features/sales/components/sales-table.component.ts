import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <!-- VISTA MÓVIL (< md): Cards compactas -->
      <div class="block md:hidden space-y-2.5">
        @for (sale of sales(); track sale.id) {
          <div class="bg-white p-3.5 rounded-xl border shadow-2xs space-y-2.5"
               [ngClass]="isCancelled(sale) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'">
            
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-mono font-black text-xs text-slate-900">{{ sale.code }}</span>
                  @if (isCancelled(sale)) {
                    <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-100 text-rose-800 rounded border border-rose-200 uppercase">
                      Anulada
                    </span>
                  }
                </div>
                <span class="text-[10px] font-mono text-slate-400 mt-0.5 block">{{ sale.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="text-right">
                <span class="font-mono text-xs font-bold text-slate-800 block">{{ sale.invoice?.fullCode || 'NV01-INT' }}</span>
                <span class="text-[9px] font-semibold block" [ngClass]="isCancelled(sale) ? 'text-rose-600' : (isInternalSale(sale) ? 'text-slate-500' : 'text-emerald-700')">
                  {{ isCancelled(sale) ? '● Anulado' : (isInternalSale(sale) ? '○ Nota de Venta' : '● ' + (sale.invoice?.status || 'Aceptado')) }}
                </span>
              </div>
            </div>

            <div class="text-xs space-y-0.5 border-t border-slate-100 pt-2">
              <span class="font-bold text-slate-900 block truncate">{{ sale.customer?.name || 'Cliente Mostrador' }}</span>
              <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Doc: {{ sale.customer?.documentNumber || 'Sin Doc' }}</span>
                <span>👤 {{ sale.seller?.email?.split('@')?.[0] || 'Caja Central' }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <div>
                <span class="text-[9px] font-mono text-slate-400 block uppercase">Total Liquidado</span>
                <span class="font-mono font-black text-sm" [ngClass]="isCancelled(sale) ? 'text-slate-400 line-through' : 'text-slate-900'">
                  S/ {{ sale.totalAmount | number:'1.2-2' }}
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                <button type="button" (click)="viewAudit.emit(sale)"
                  class="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs">
                  Forense
                </button>
                @if (!isCancelled(sale)) {
                  <button type="button" (click)="requestCancel.emit(sale)"
                    class="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="Anular venta y retornar repuestos a Kardex">
                    Anular
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No hay transacciones registradas hoy.
          </div>
        }
      </div>

      <!-- VISTA ESCRITORIO (>= md): Tabla completa -->
      <div class="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[9px] border-b border-slate-200 tracking-wider">
                <th class="px-4 py-3">Correlativo / Hora</th>
                <th class="px-4 py-3">Comprobante Fiscal</th>
                <th class="px-4 py-3">Cliente &amp; RUC/DNI</th>
                <th class="px-4 py-3">Vendedor</th>
                <th class="px-4 py-3">Liquidación</th>
                <th class="px-4 py-3 text-right">Total (PEN)</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (sale of sales(); track sale.id) {
                <tr class="hover:bg-slate-50/60 transition-colors" [class.bg-rose-50/30]="isCancelled(sale)">
                  <td class="px-4 py-3 font-mono">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-slate-900">{{ sale.code }}</span>
                      @if (isCancelled(sale)) {
                        <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-100 text-rose-700 rounded border border-rose-200 uppercase">
                          Anulada
                        </span>
                      }
                    </div>
                    <span class="text-[10px] text-slate-400 mt-0.5 block">{{ sale.createdAt | date:'HH:mm:ss a' }}</span>
                  </td>

                  <td class="px-4 py-3 font-mono">
                    <span class="font-bold text-slate-800">{{ sale.invoice?.fullCode || 'NV01-INT' }}</span>
                    @if (isCancelled(sale)) {
                      <span class="block text-[10px] font-semibold text-rose-600">● Anulado</span>
                    } @else if (isInternalSale(sale)) {
                      <span class="block text-[10px] font-semibold text-slate-500">○ Modo Interno</span>
                    } @else {
                      <span class="block text-[10px] font-semibold text-emerald-700">● {{ sale.invoice?.status || 'Aceptado' }}</span>
                    }
                  </td>

                  <td class="px-4 py-3">
                    <span class="font-bold text-slate-900 block truncate max-w-[180px]">{{ sale.customer?.name || 'Cliente Mostrador' }}</span>
                    <span class="font-mono text-slate-400 text-[10px]">{{ sale.customer?.documentNumber || 'Sin Doc' }}</span>
                  </td>

                  <td class="px-4 py-3 text-slate-600">
                    {{ sale.seller?.email?.split('@')?.[0] || 'Caja Central' }}
                  </td>

                  <td class="px-4 py-3">
                    @for (p of sale.payments; track $index) {
                      <div class="text-[10px] font-mono">
                        <span class="text-slate-400">{{ p.method }}:</span>
                        <span class="font-semibold text-slate-700 ml-1">S/ {{ p.amount | number:'1.2-2' }}</span>
                      </div>
                    }
                  </td>

                  <td class="px-4 py-3 text-right font-mono font-black" [ngClass]="isCancelled(sale) ? 'text-slate-400 line-through' : 'text-slate-900'">
                    S/ {{ sale.totalAmount | number:'1.2-2' }}
                  </td>

                  <td class="px-4 py-3 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <button type="button" (click)="viewAudit.emit(sale)"
                        class="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs">
                        Forense
                      </button>
                      @if (!isCancelled(sale)) {
                        <button type="button" (click)="requestCancel.emit(sale)"
                          class="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Anular venta y retornar repuestos a Kardex">
                          Anular
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-slate-400 text-xs">
                    No hay transacciones registradas hoy.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SalesTableComponent {
  sales = input.required<Sale[]>();
  viewAudit = output<Sale>();
  requestCancel = output<Sale>();

  isCancelled(sale: Sale): boolean {
    return sale.invoice?.status === 'ANULLED' || !!sale.notes?.includes('[ANULADA]');
  }

  isInternalSale(sale: Sale): boolean {
    if (!sale.invoice) return false;
    const status = sale.invoice.status as string;
    return sale.invoice.series === 'NV01' || status === 'INTERNAL' || sale.invoice.type === 'NOTA_VENTA';
  }
}