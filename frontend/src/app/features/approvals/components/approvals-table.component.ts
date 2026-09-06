import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProformaApiDto } from '../approvals-list.component';

@Component({
    selector: 'app-approvals-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div class="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-700">Solicitudes en Espera</span>
        @if (loading()) {
          <span class="text-xs text-emerald-600 animate-pulse font-medium">Cargando datos...</span>
        }
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
              <th class="py-2.5 px-3">Código</th>
              <th class="py-2.5 px-3">Cliente</th>
              <th class="py-2.5 px-3">Vendedor</th>
              <th class="py-2.5 px-3 text-right">Monto Total</th>
              <th class="py-2.5 px-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (p of proformas(); track p.id) {
              <tr 
                (click)="select.emit(p)"
                [ngClass]="selectedId() === p.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50'"
                class="cursor-pointer transition-colors">
                
                <td 
                  class="py-2.5 px-3 transition-all"
                  [ngClass]="selectedId() === p.id ? 'border-l-4 border-l-[#064e3b]' : 'border-l-4 border-l-transparent'">
                  <div class="font-bold text-slate-900">{{ p.code }}</div>
                  <div class="text-[10px] text-slate-400">{{ p.createdAt | date:'short' }}</div>
                </td>

                <td class="py-2.5 px-3">
                  <div class="font-medium text-slate-800 truncate max-w-[160px]">{{ p.customer.name }}</div>
                  <div class="text-[10px] text-slate-400">Doc: {{ p.customer.documentNumber }}</div>
                </td>

                <td class="py-2.5 px-3 text-slate-600">
                  <div class="truncate max-w-[120px]">{{ p.seller?.email || 'Ventas' }}</div>
                </td>

                <td class="py-2.5 px-3 text-right">
                  <div class="font-bold font-mono text-slate-900">S/ {{ parseAmount(p.totalAmount) | number:'1.2-2' }}</div>
                  <span class="text-[9px] text-slate-400">Inc. IGV</span>
                </td>

                <td class="py-2.5 px-3 text-center">
                  <button 
                    type="button"
                    class="text-[10px] font-semibold px-2 py-1 rounded border transition-colors cursor-pointer"
                    [ngClass]="selectedId() === p.id ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'">
                    {{ selectedId() === p.id ? 'Seleccionada' : 'Inspeccionar' }}
                  </button>
                </td>
              </tr>
            } @empty {
              @if (!loading()) {
                <tr>
                  <td colspan="5" class="text-center py-8 text-slate-400 text-xs">
                    No hay solicitudes de aprobación pendientes en la base de datos.
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ApprovalsTableComponent {
    proformas = input.required<ProformaApiDto[]>();
    selectedId = input<string | undefined>();
    loading = input<boolean>(false);

    select = output<ProformaApiDto>();

    parseAmount(val: number | string | null | undefined): number {
        return Number(val) || 0;
    }
}