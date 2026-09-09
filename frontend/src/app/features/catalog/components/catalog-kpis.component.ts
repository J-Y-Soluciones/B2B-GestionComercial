//src/app/features/catalog/components/catalog-kpis.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- KPI 1 -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Catálogo Activo B2B</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ totalProducts() | number }}</span>
            <span class="text-xs font-semibold text-slate-500 font-mono">SKUs</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block flex items-center gap-1">
            <span>✓</span> 94.2% habilitados para venta & proformas
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
          📦
        </div>
      </div>

      <!-- KPI 2 -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Stock Físico Consolidado</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ totalUnits() | number }}</span>
            <span class="text-xs font-semibold text-slate-500 font-mono">Unidades</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">
            3 sucursales propias + {{ suppliersCount() }} proveedores en red
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-base">
          📈
        </div>
      </div>

      <!-- KPI 3 (Alerta Ámbar) -->
      <div class="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider">Bajo Stock Mínimo</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-200 text-amber-900 uppercase">Urgente</span>
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-amber-950 font-mono">{{ lowStockCount() }}</span>
            <span class="text-xs font-semibold text-amber-800 font-mono">Repuestos Críticos</span>
          </div>
          <span class="text-[10px] text-amber-700 font-mono mt-0.5 block">
            Requieren reposición o pedido a mayorista
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center text-base font-bold">
          ⚠️
        </div>
      </div>
    </div>
  `
})
export class CatalogKpisComponent {
  totalProducts = input.required<number>();
  totalUnits = input.required<number>();
  suppliersCount = input.required<number>();
  lowStockCount = input.required<number>();
}