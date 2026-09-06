import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-users-kpis',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Colaboradores</span>
          <span class="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{{ totalCount() }}</span>
          <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Usuarios en el sistema</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-base font-bold">
          👥
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Usuarios Activos</span>
          <span class="text-2xl font-black text-emerald-800 font-mono mt-0.5 block">{{ activeCount() }}</span>
          <span class="text-[10px] text-emerald-600 font-mono mt-0.5 block">Cuentas habilitadas</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-bold">
          ✅
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Accesos Suspendidos</span>
          <span class="text-2xl font-black text-slate-500 font-mono mt-0.5 block">{{ inactiveCount() }}</span>
          <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Inactivos (Preservados para Auditoría)</span>
        </div>
        <div class="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-base font-bold">
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