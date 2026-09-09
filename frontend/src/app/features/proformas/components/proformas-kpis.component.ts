import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-proformas-kpis',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Total -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Proformas</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ totalCount() }}</span>
            <span class="text-xs font-medium text-slate-500">documentos</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">↗ +18.4% vs mes anterior</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center text-base">📄</div>
      </div>

      <!-- Aprobadas -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Listas para Venta</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ approvedCount() }}</span>
            <span class="text-xs font-medium text-slate-500">activas</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block font-bold">53.8% tasa de conversión</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-base font-bold">✓</div>
      </div>

      <!-- Pendientes T3 -->
      <div class="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider block">Pendientes Aprobación T3</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-amber-950 font-mono">{{ pendingCount() }}</span>
            <span class="text-xs font-semibold text-amber-800">en espera</span>
          </div>
          <span class="text-[10px] text-amber-700 font-mono mt-0.5 block">⚠️ Requiere Atención Gerente</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-base font-bold">⚠️</div>
      </div>

      <!-- Monto -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Monto Total Cotizado</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-black text-slate-900 font-mono">S/ {{ totalAmount() | number:'1.2-2' }}</span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">PEN</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">Acumulado activo en red</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center text-base">💵</div>
      </div>
    </div>
  `
})
export class ProformasKpisComponent {
    totalCount = input.required<number>();
    approvedCount = input.required<number>();
    pendingCount = input.required<number>();
    totalAmount = input.required<number>();
}