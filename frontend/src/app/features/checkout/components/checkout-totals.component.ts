//src/app/features/checkout/components/checkout-totals.component.ts
import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-totals',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
      <div class="flex justify-between text-xs text-slate-600">
        <span>Subtotal (Base Imponible Gravada)</span>
        <span class="font-mono font-semibold">S/ {{ subtotal() | number:'1.2-2' }}</span>
      </div>
      <div class="flex justify-between text-xs text-slate-600">
        <span>I.G.V. (18% Oficial)</span>
        <span class="font-mono font-semibold">S/ {{ igv() | number:'1.2-2' }}</span>
      </div>
      <div class="pt-3 border-t border-slate-200 flex justify-between items-baseline">
        <span class="text-sm font-bold text-slate-900">Total a Cobrar</span>
        <span class="text-2xl font-black font-mono text-emerald-800">
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