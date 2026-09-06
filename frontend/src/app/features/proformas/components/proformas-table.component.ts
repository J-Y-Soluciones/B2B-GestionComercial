import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Proforma } from '../../../core/models/proforma.model';

@Component({
    selector: 'app-proformas-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
            <th class="py-3 px-4">Correlativo / Vendedor</th>
            <th class="py-3 px-4">Cliente & Tipo</th>
            <th class="py-3 px-4">Ítems & Desglose</th>
            <th class="py-3 px-4 text-right">Monto Total (PEN)</th>
            <th class="py-3 px-4 text-center">Estado</th>
            <th class="py-3 px-4 text-center">Emisión & Validez</th>
            <th class="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (proformas().length === 0) {
            <tr>
              <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                No se encontraron proformas con los filtros seleccionados.
              </td>
            </tr>
          }

          @for (prof of proformas(); track prof.id) {
            <tr class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3.5 px-4">
                <span class="font-mono font-black text-slate-900 text-xs">{{ prof.code }}</span>
                <div class="text-[11px] text-slate-400 mt-0.5">👤 {{ prof.seller?.email?.split('@')?.[0] || 'Vendedor' }}</div>
              </td>

              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 text-xs">{{ prof.customer?.name || 'Cliente Mostrador' }}</div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ prof.customer?.documentNumber || 'Sin Doc' }}</div>
              </td>

              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-800 text-xs">{{ prof.details?.length || 0 }} SKUs</div>
                <div class="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{{ getItemsSummary(prof) }}</div>
              </td>

              <td class="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                S/ {{ prof.totalAmount | number:'1.2-2' }}
              </td>

              <td class="py-3.5 px-4 text-center">
                <span [class]="getStatusClass(prof.status)" class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase">
                  {{ prof.status }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                {{ prof.createdAt | date:'dd MMM, HH:mm' }}
              </td>

              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5">
                  <button type="button" (click)="downloadPdf.emit(prof)" [disabled]="downloadingId() === prof.id"
                    class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs">
                    📥
                  </button>
                  @if (prof.status === 'APPROVED' || prof.status === 'PENDING') {
                    <button type="button" (click)="facturar.emit(prof)"
                      class="px-3 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                      <span>⚡ Facturar</span>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ProformasTableComponent {
    proformas = input.required<Proforma[]>();
    downloadingId = input<string | null>(null);

    downloadPdf = output<Proforma>();
    facturar = output<Proforma>();

    getItemsSummary(prof: Proforma): string {
        return (prof.details || []).map((d: any) => d.product?.name || 'Repuesto').join(', ');
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'PENDING_APPROVAL': return 'bg-amber-50 text-amber-900 border-amber-200';
            case 'REJECTED': return 'bg-rose-50 text-rose-800 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    }
}