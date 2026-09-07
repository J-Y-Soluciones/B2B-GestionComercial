import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-checkout-header',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="flex items-center justify-between pb-2 border-b border-slate-200/80">
      <div>
        <h1 class="text-xl font-black text-slate-900 tracking-tight">Checkout & Emisión de Comprobante</h1>
        <p class="text-xs text-slate-500 mt-0.5">Punto de Venta Mostrador & Descarga de Inventario</p>
      </div>

      <div class="flex items-center gap-2">
        @if (hasActiveProforma()) {
          <button type="button" (click)="discard.emit()"
                  class="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            ✕ Descartar Operación
          </button>
          <button type="button" (click)="openPicker.emit()"
                  class="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer">
            🔍 Cambiar Proforma
          </button>
        }
        <button type="button" (click)="returnToProformas.emit()"
                class="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-2xs transition-all cursor-pointer">
          ← Volver (ESC)
        </button>
      </div>
    </div>
  `
})
export class CheckoutHeaderComponent {
    hasActiveProforma = input<boolean>(false);
    discard = output<void>();
    openPicker = output<void>();
    returnToProformas = output<void>();
}