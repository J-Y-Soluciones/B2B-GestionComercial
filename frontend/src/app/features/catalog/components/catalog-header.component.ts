// src/app/features/catalog/components/catalog-header.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs font-sans">
      <div>
        <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          COMERCIAL &bull; INVENTARIO &bull; CATÁLOGO
        </div>
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
            Catálogo Maestro de Repuestos &amp; Existencias
          </h1>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Gestión técnica de repuestos, matriz de precios B2B (Tiers 1-3) y existencias por mayorista.
        </p>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <!-- Actualizar F5 -->
        <button type="button" (click)="refresh.emit()"
          class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          title="Actualizar catálogo">
          <span>🔄</span>
          <span class="hidden sm:inline">Actualizar</span>
          <kbd class="hidden md:inline-block text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F5</kbd>
        </button>

        <!-- Nuevo Repuesto F4 -->
        @if (canManage()) {
          <button type="button" (click)="create.emit()"
            class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>+</span>
            <span>Nuevo Repuesto</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F4</kbd>
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