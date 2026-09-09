import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <!-- Total -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Colaboradores</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono text-slate-900">{{ totalCount() }}</span>
            <span class="text-xs font-medium text-slate-500 font-mono">cuentas</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Directorio corporativo activo</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
          👥
        </div>
      </div>

      <!-- Activos -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Accesos Habilitados</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono text-emerald-800">{{ activeCount() }}</span>
            <span class="text-xs font-semibold text-emerald-700 font-mono">operativos</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block font-semibold">Sesión e inventario activos</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-base font-bold">
          ✓
        </div>
      </div>

      <!-- Suspendidos -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Accesos Suspendidos</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono text-slate-500">{{ inactiveCount() }}</span>
            <span class="text-xs font-medium text-slate-400 font-mono">inactivos</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Preservados para auditoría fiscal</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-base">
          🚫
        </div>
      </div>
    </div>
  `
})
export class UsersKpisComponent {
  totalCount = input.required<number>();
  activeCount = input.required<number>();
  inactiveCount = input.required<number>();
}