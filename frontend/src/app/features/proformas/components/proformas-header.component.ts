import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-proformas-header',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          COMERCIAL &bull; VENTAS B2B &bull; BANDEJA HISTÓRICA DE COTIZACIONES
        </div>
        <div class="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
            Historial Central de Proformas & Cotizaciones B2B
          </h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Validez: 48 Horas
          </span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SUNAT & ERP Real-Time
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Gestión unificada de órdenes de cotización, control de márgenes T3 y conversión a facturación.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" (click)="refresh.emit()"
          class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
          <span>🔄</span> Actualizar <kbd class="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F5</kbd>
        </button>
        <button type="button" (click)="exportExcel.emit()"
          class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
          <span>📥</span> Exportar Excel
        </button>
        <a routerLink="/proformas/create"
          class="text-xs bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
          <span>+ Nueva Proforma</span>
          <kbd class="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F2</kbd>
        </a>
      </div>
    </div>
  `
})
export class ProformasHeaderComponent {
    refresh = output<void>();
    exportExcel = output<void>();
}