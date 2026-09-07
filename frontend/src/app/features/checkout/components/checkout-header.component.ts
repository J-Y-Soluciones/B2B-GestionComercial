import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div>
        <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          COMERCIAL &bull; CAJA &bull; PUNTO DE VENTA MOSTRADOR
        </div>
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
            Checkout &amp; Emisión de Comprobante
          </h1>
          <span class="hidden md:inline-flex bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            F8
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Cobro en mostrador, selección de lote y emisión de Boleta, Factura o Ticket.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap self-end sm:self-auto">
        @if (hasActiveProforma()) {
          <button type="button" (click)="discard.emit()"
            class="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs">
            ✕ Descartar
          </button>
          <button type="button" (click)="openPicker.emit()"
            class="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer">
            🔍 Cambiar Proforma
          </button>
        }
        <button type="button" (click)="returnToProformas.emit()"
          class="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer">
          <span>&larr;</span> Volver
          <kbd class="hidden md:inline-block text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded ml-1">ESC</kbd>
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