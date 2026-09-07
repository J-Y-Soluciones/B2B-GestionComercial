import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-kpis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      <!-- Total Ventas -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Ventas Liquidadas</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono text-slate-900">S/ {{ totalSales() | number:'1.2-2' }}</span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">PEN</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block font-semibold">
            {{ salesCount() }} operaciones activas
          </span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
          💰
        </div>
      </div>

      <!-- Comprobantes -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Comprobantes Fiscales</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono text-slate-900">{{ invoicesCount() }}</span>
            <span class="text-xs font-semibold text-slate-500 font-mono">docs</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">Boletas (B001) & Facturas (F001)</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
          📑
        </div>
      </div>

      <!-- Margen Bruto -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Margen Bruto Promedio</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black font-mono" [ngClass]="averageMargin() > 0 ? 'text-emerald-800' : 'text-slate-400'">
              {{ averageMargin() > 0 ? '+' : '' }}{{ averageMargin() | number:'1.1-1' }}%
            </span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">B2B</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">Rendimiento sobre costo de reposición</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-base font-bold">
          📈
        </div>
      </div>
    </div>
  `
})
export class SalesKpisComponent {
  totalSales = input.required<number>();
  salesCount = input.required<number>();
  invoicesCount = input.required<number>();
  averageMargin = input<number>(0);
}