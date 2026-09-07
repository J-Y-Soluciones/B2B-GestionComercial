import { Component, input, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import type { Proforma } from '../../../core/models/proforma.model';

@Component({
  selector: 'app-proformas-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <!-- VISTA MÓVIL (< md): Cards compactas sin scroll horizontal -->
      <div class="block md:hidden space-y-3 p-3">
        @if (proformas().length === 0) {
          <div class="py-10 text-center text-slate-400 text-xs">
            No se encontraron proformas con los filtros seleccionados.
          </div>
        }

        @for (prof of proformas(); track prof.id) {
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <!-- Fila Superior: Código, Estado y Fecha -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-mono font-extrabold text-slate-900 text-xs">{{ prof.code }}</span>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  {{ prof.createdAt | date:'dd MMM, HH:mm' }}
                </div>
              </div>
              <span [class]="getStatusClass(prof.status)" class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase shrink-0">
                {{ getStatusLabel(prof.status) }}
              </span>
            </div>

            <!-- Cliente y Desglose -->
            <div class="space-y-0.5 border-t border-slate-100 pt-2 text-xs">
              <div class="font-bold text-slate-900 leading-tight">{{ prof.customer?.name || 'Cliente Mostrador' }}</div>
              <div class="text-[10px] text-slate-500 font-mono">{{ prof.customer?.documentNumber || 'Sin Doc' }}</div>
              <div class="text-[10px] text-slate-400 mt-1 truncate">
                📦 {{ prof.details?.length || 0 }} SKUs &bull; {{ getItemsSummary(prof) }}
              </div>
            </div>

            <!-- Total y Acciones Inferiores -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span class="text-[9px] font-mono text-slate-400 block uppercase">Total PEN</span>
                <span class="font-mono font-black text-slate-900 text-sm">
                  S/ {{ prof.totalAmount | number:'1.2-2' }}
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                <button type="button" (click)="downloadPdf.emit(prof)" [disabled]="downloadingId() === prof.id"
                  class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs text-xs"
                  title="Descargar PDF">
                  📥
                </button>
                @if (prof.status === 'APPROVED' || prof.status === 'PENDING') {
                  <button type="button" (click)="goToCheckout(prof.id)"
                    class="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer">
                    <span>⚡ Facturar</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- VISTA DESKTOP (>= md): Tabla completa densa -->
      <div class="hidden md:block overflow-x-auto w-full">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
              <th class="py-3 px-4">Correlativo / Vendedor</th>
              <th class="py-3 px-4">Cliente &amp; Tipo</th>
              <th class="py-3 px-4">Ítems &amp; Desglose</th>
              <th class="py-3 px-4 text-right">Monto Total (PEN)</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-center">Emisión</th>
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
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                    👤 {{ prof.seller?.email?.split('@')?.[0] || 'Vendedor' }}
                  </div>
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
                    {{ getStatusLabel(prof.status) }}
                  </span>
                </td>

                <td class="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                  {{ prof.createdAt | date:'dd MMM, HH:mm' }}
                </td>

                <td class="py-3.5 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <button type="button" (click)="downloadPdf.emit(prof)" [disabled]="downloadingId() === prof.id"
                      class="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                      title="Descargar PDF">
                      📥
                    </button>
                    @if (prof.status === 'APPROVED' || prof.status === 'PENDING') {
                      <button 
                        type="button" 
                        (click)="goToCheckout(prof.id)"
                        class="px-2.5 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap">
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
    </div>
  `
})
export class ProformasTableComponent {
  private readonly router = inject(Router);

  proformas = input.required<Proforma[]>();
  downloadingId = input<string | null>(null);

  downloadPdf = output<Proforma>();
  facturar = output<Proforma>();

  getItemsSummary(prof: Proforma): string {
    return (prof.details || []).map((d: any) => d.product?.name || 'Repuesto').join(', ');
  }

  goToCheckout(proformaId: string): void {
    this.router.navigate(['/sales/checkout', proformaId]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENDING_APPROVAL': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Aprobada';
      case 'PENDING_APPROVAL': return 'Por Aprobar (T3)';
      case 'REJECTED': return 'Rechazada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  }
}