import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-kpis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ventas del Día Totales</span>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-2xl font-black font-mono text-slate-900">S/ {{ totalSales() | number:'1.2-2' }}</span>
          <span class="text-xs font-semibold text-emerald-600 font-mono">{{ salesCount() }} operaciones</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Comprobantes Electrónicos</span>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-2xl font-black font-mono text-slate-900">{{ invoicesCount() }}</span>
          <span class="text-xs text-slate-500 font-medium">Documentos emitidos</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Margen Bruto Realizado</span>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-2xl font-black font-mono" [ngClass]="averageMargin() > 0 ? 'text-emerald-700' : 'text-slate-400'">
            {{ averageMargin() > 0 ? '+' : '' }}{{ averageMargin() | number:'1.1-1' }}%
          </span>
          <span class="text-xs text-slate-500 font-medium">Promedio B2B</span>
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