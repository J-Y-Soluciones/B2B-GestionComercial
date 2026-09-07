import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th class="px-4 py-3">Correlativo / Hora</th>
              <th class="px-4 py-3">Comprobante Fiscal</th>
              <th class="px-4 py-3">Cliente & RUC/DNI</th>
              <th class="px-4 py-3">Vendedor</th>
              <th class="px-4 py-3">Liquidación</th>
              <th class="px-4 py-3 text-right">Total (PEN)</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (sale of sales(); track sale.id) {
              <tr class="hover:bg-slate-50/80 transition-colors" [class.bg-rose-50/30]="isCancelled(sale)">
                <td class="px-4 py-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-slate-900">{{ sale.code }}</span>
                    @if (isCancelled(sale)) {
                      <span class="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-700 rounded border border-rose-200">ANULADA</span>
                    }
                  </div>
                  <span class="text-[11px] text-slate-400">{{ sale.createdAt | date:'HH:mm:ss a' }}</span>
                </td>
                <td class="px-4 py-3 font-mono">
                  <span class="font-semibold text-slate-800">{{ sale.invoice?.fullCode || 'TICKET-INT' }}</span>
                  <span class="block text-[10px] font-semibold" [ngClass]="isCancelled(sale) ? 'text-rose-600' : 'text-emerald-700'">
                    ● {{ isCancelled(sale) ? 'Anulado' : (sale.invoice?.status || 'Aceptado') }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-bold text-slate-900 block">{{ sale.customer?.name || 'Cliente Mostrador' }}</span>
                  <span class="font-mono text-slate-400 text-[11px]">{{ sale.customer?.documentNumber || 'Sin Doc' }}</span>
                </td>
                <td class="px-4 py-3 text-slate-700">
                  {{ sale.seller?.email?.split('@')?.[0] || 'Caja Central' }}
                </td>
                <td class="px-4 py-3">
                  @for (p of sale.payments; track $index) {
                    <div class="text-[11px] font-mono">
                      <span class="text-slate-500">{{ p.method }}:</span>
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
                            class="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer">
                      Forense
                    </button>
                    @if (!isCancelled(sale)) {
                      <button type="button" (click)="requestCancel.emit(sale)"
                              class="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Anular venta y retornar repuestos a Kardex">
                        Anular
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                  No hay transacciones registradas hoy.
                </td>
              </tr>
            }
          </tbody>
        </table>
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
}