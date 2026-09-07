import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-proformas-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div>
        <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          COMERCIAL &bull; VENTAS B2B &bull; BANDEJA HISTÓRICA
        </div>
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
            Historial Central de Proformas &amp; Cotizaciones B2B
          </h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Validez: 48 Horas
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Gestión unificada de cotizaciones, control de márgenes protegidos y conversión a facturación.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap self-end sm:self-auto">
        <button type="button" (click)="refresh.emit()"
          class="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          title="Actualizar bandeja">
          <span>🔄</span>
          <span class="hidden sm:inline">Actualizar</span>
          <kbd class="hidden md:inline-block text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F5</kbd>
        </button>

        <button type="button" (click)="exportExcel.emit()"
          class="hidden sm:flex text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors items-center gap-1.5 cursor-pointer font-medium">
          <span>📥</span> Exportar Excel
        </button>

        <a routerLink="/proformas/create"
          class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 sm:px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
          <span>+</span>
          <span>Nueva Proforma</span>
          <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-200 px-1 rounded">F2</kbd>
        </a>
      </div>
    </div>
  `
})
export class ProformasHeaderComponent {
  refresh = output<void>();
  exportExcel = output<void>();
}