import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-approvals-kpis',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- Monto en Revisión -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Monto en Revisión (T3)</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-xl font-bold text-slate-900 font-mono">S/ {{ totalPendingAmount() | number:'1.2-2' }}</span>
          </div>
          <span class="text-[10px] text-slate-400 mt-0.5 block">{{ pendingCount() }} proformas por evaluar</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">
          💵
        </div>
      </div>

      <!-- Urgentes -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pendientes Urgentes</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-xl font-bold text-slate-900 font-mono">{{ pendingCount() }} Proformas</span>
          </div>
          <span class="text-[10px] text-amber-600 mt-0.5 block">Requieren validación de margen</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-lg">
          ⏱️
        </div>
      </div>

      <!-- Sincronizadas -->
      <div class="bg-white p-3.5 rounded-xl border-2 border-amber-300 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Total Proformas Cargadas</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-xl font-bold text-amber-900 font-mono">{{ totalLoaded() }} Registros</span>
          </div>
          <span class="text-[10px] text-slate-500 mt-0.5 block">Sincronizado con PostgreSQL</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg">
          ⚡
        </div>
      </div>
    </div>
  `
})
export class ApprovalsKpisComponent {
    totalPendingAmount = input.required<number>();
    pendingCount = input.required<number>();
    totalLoaded = input.required<number>();
}