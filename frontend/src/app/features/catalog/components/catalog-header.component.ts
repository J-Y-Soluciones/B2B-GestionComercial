import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          COMERCIAL &bull; INVENTARIO &bull; LISTA MAESTRA DE REPUESTOS
        </div>
        <div class="flex items-center gap-2.5 mt-0.5">
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
           Catálogo Maestro de Repuestos & Existencias Físicas
          </h1>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronizado SUNAT & ERP (Real-Time)
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" (click)="refresh.emit()"
          class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
          <span>🔄</span> Actualizar <kbd class="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F5</kbd>
        </button>
        <button type="button" disabled
          class="text-xs text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-not-allowed font-medium">
          <span>📥</span> 
          <span>Importar / Exportar Excel</span>
          <span class="text-[9px] font-mono bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-bold uppercase">
            Próximamente
          </span>
        </button>
        @if (canManage()) {
          <button type="button" (click)="create.emit()"
            class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>+ Nuevo Repuesto</span>
            <kbd class="text-[9px] font-mono bg-emerald-900 text-emerald-200 px-1 rounded">F4</kbd>
          </button>
        }
      </div>
    </div>
  `
})
export class CatalogHeaderComponent {
  canManage = input.required<boolean>();
  refresh = output<void>();
  create = output<void>();
}