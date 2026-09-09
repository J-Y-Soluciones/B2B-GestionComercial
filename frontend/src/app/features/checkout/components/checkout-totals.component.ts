import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-totals',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-2.5">
      <div class="flex justify-between text-xs text-slate-500 font-mono">
        <span>Subtotal Neto (Base Gravada)</span>
        <span class="font-semibold text-slate-800">S/ {{ subtotal() | number:'1.2-2' }}</span>
      </div>
      <div class="flex justify-between text-xs text-slate-500 font-mono">
        <span>I.G.V. Oficial (18%)</span>
        <span class="font-semibold text-slate-800">S/ {{ igv() | number:'1.2-2' }}</span>
      </div>
      <div class="pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
        <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">Total a Cobrar</span>
        <span class="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
          S/ {{ total() | number:'1.2-2' }}
        </span>
      </div>
    </div>
  `
})
export class CheckoutTotalsComponent {
  total = input.required<number>();

  subtotal = computed(() => {
    return Number((this.total() / 1.18).toFixed(2));
  });

  igv = computed(() => {
    return Number((this.total() - this.subtotal()).toFixed(2));
  });
}