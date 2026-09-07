import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approvals-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      <!-- Monto en Revisión -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Monto en Revisión (T3)</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">S/ {{ totalPendingAmount() | number:'1.2-2' }}</span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">PEN</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">{{ pendingCount() }} proformas por evaluar</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
          💵
        </div>
      </div>

      <!-- Pendientes Urgentes -->
      <div class="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider">Pendientes de Margen</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-200 text-amber-900 uppercase">Urgente</span>
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-amber-950 font-mono">{{ pendingCount() }}</span>
            <span class="text-xs font-semibold text-amber-800 font-mono">documentos</span>
          </div>
          <span class="text-[10px] text-amber-700 font-mono mt-0.5 block">Requieren validación de precio T3</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-base font-bold">
          ⚠️
        </div>
      </div>

      <!-- Total Registros -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Bandeja Activa</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-slate-900 font-mono">{{ totalLoaded() }}</span>
            <span class="text-xs font-semibold text-slate-500 font-mono">en cola</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block font-semibold">Trazabilidad en tiempo real</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-base">
          📋
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