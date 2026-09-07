import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProformaApiDto } from '../approvals-list.component';

@Component({
  selector: 'app-approvals-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <!-- VISTA MÓVIL (< md): Cards compactas seleccionables -->
      <div class="block md:hidden space-y-2.5">
        <div class="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <span>Solicitudes Pendientes ({{ proformas().length }})</span>
          @if (loading()) {
            <span class="text-[11px] text-emerald-700 font-mono animate-pulse">Cargando...</span>
          }
        </div>

        @for (p of proformas(); track p.id) {
          <div 
            (click)="select.emit(p)"
            [ngClass]="selectedId() === p.id ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200'"
            class="p-3.5 rounded-xl border shadow-2xs space-y-2.5 transition-all cursor-pointer">
            
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-mono font-extrabold text-slate-900 text-xs">{{ p.code }}</span>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
              <span class="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                Tier 3
              </span>
            </div>

            <div class="text-xs space-y-0.5 border-t border-slate-100 pt-2">
              <div class="font-bold text-slate-900 truncate">{{ p.customer.name }}</div>
              <div class="text-[10px] text-slate-500 font-mono">RUC/DNI: {{ p.customer.documentNumber }}</div>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <div>
                <span class="text-[9px] text-slate-400 font-mono block">MONTO TOTAL</span>
                <span class="font-mono font-black text-slate-900 text-sm">
                  S/ {{ parseAmount(p.totalAmount) | number:'1.2-2' }}
                </span>
              </div>
              <button 
                type="button"
                [class]="selectedId() === p.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'"
                class="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors">
                {{ selectedId() === p.id ? 'Inspeccionando' : 'Ver Detalle' }}
              </button>
            </div>
          </div>
        } @empty {
          @if (!loading()) {
            <div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No hay solicitudes de aprobación pendientes.
            </div>
          }
        }
      </div>

      <!-- VISTA ESCRITORIO (>= md): Tabla estricta -->
      <div class="hidden md:flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800">Solicitudes en Espera de Autorización</span>
          @if (loading()) {
            <span class="text-xs text-emerald-700 font-mono animate-pulse font-medium">Cargando datos...</span>
          }
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase text-[9px] font-mono font-bold tracking-wider">
                <th class="py-3 px-3.5">Código / Fecha</th>
                <th class="py-3 px-3.5">Cliente</th>
                <th class="py-3 px-3.5">Asesor Comercial</th>
                <th class="py-3 px-3.5 text-right">Monto Total</th>
                <th class="py-3 px-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of proformas(); track p.id) {
                <tr 
                  (click)="select.emit(p)"
                  [ngClass]="selectedId() === p.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50/60'"
                  class="cursor-pointer transition-colors">
                  
                  <td 
                    class="py-3 px-3.5 transition-all"
                    [ngClass]="selectedId() === p.id ? 'border-l-4 border-l-emerald-800' : 'border-l-4 border-l-transparent'">
                    <div class="font-mono font-black text-slate-900 text-xs">{{ p.code }}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                  </td>

                  <td class="py-3 px-3.5">
                    <div class="font-bold text-slate-900 truncate max-w-[170px]">{{ p.customer.name }}</div>
                    <div class="text-[10px] text-slate-500 font-mono mt-0.5">Doc: {{ p.customer.documentNumber }}</div>
                  </td>

                  <td class="py-3 px-3.5 text-slate-600">
                    <div class="text-xs font-medium truncate max-w-[130px]">{{ p.seller?.email?.split('@')?.[0] || 'Ventas' }}</div>
                  </td>

                  <td class="py-3 px-3.5 text-right">
                    <div class="font-bold font-mono text-slate-900">S/ {{ parseAmount(p.totalAmount) | number:'1.2-2' }}</div>
                    <span class="text-[9px] text-slate-400 font-mono">Inc. IGV</span>
                  </td>

                  <td class="py-3 px-3.5 text-center">
                    <button 
                      type="button"
                      class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
                      [ngClass]="selectedId() === p.id ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'">
                      {{ selectedId() === p.id ? 'Seleccionada' : 'Inspeccionar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                @if (!loading()) {
                  <tr>
                    <td colspan="5" class="text-center py-10 text-slate-400 text-xs">
                      No hay solicitudes de aprobación pendientes.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
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