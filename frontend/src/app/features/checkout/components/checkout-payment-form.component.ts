import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { InvoiceType, PaymentMethod } from '../../../core/models/sale.model';

@Component({
  selector: 'app-checkout-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <!-- Flag de Facturación SUNAT -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-slate-800 block">Sincronización OSE / SUNAT</span>
          <span class="text-[11px] text-slate-500">
            {{ sunatEnabled() ? 'Timbrado y envío electrónico activo' : 'Modo Interno (Boleta Simple / Nota de Venta)' }}
          </span>
        </div>
        <button type="button" (click)="toggleSunat.emit()"
                [class]="sunatEnabled() ? 'bg-emerald-600' : 'bg-slate-300'"
                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out">
          <span [class.translate-x-5]="sunatEnabled()" class="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
      </div>

      <!-- Tipo de Comprobante -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Comprobante</label>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" (click)="selectedType.set('BOLETA')"
                  [ngClass]="selectedType() === 'BOLETA' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer">Boleta (B001)</button>
          <button type="button" (click)="selectedType.set('FACTURA')"
                  [ngClass]="selectedType() === 'FACTURA' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer">Factura (F001)</button>
          <button type="button" (click)="selectedType.set('NOTA_VENTA')"
                  [ngClass]="selectedType() === 'NOTA_VENTA' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  class="py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer">Ticket Rápido</button>
        </div>
      </div>

      <!-- Alertas de Stock o Normativas -->
      @if (blockingErrorMessage()) {
        <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
          <span class="font-bold text-sm leading-none">⚠️</span>
          <p class="leading-snug">{{ blockingErrorMessage() }}</p>
        </div>
      }

      <!-- Métodos de Pago -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medio de Pago</label>
        <div class="grid grid-cols-2 gap-2">
          @for (m of paymentMethods; track m.id) {
            <button type="button" (click)="selectedMethod.set(m.id)"
                    [ngClass]="selectedMethod() === m.id ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
                    class="p-3 border rounded-xl text-left text-xs transition-all cursor-pointer">
              <span class="block text-xs font-bold">{{ m.label }}</span>
              <span class="text-[10px] text-slate-400 block">{{ m.sub }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Efectivo / Vuelto -->
      @if (selectedMethod() === 'CASH') {
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div class="flex items-center justify-between text-xs">
            <label class="font-bold text-slate-700">Monto Recibido</label>
            <input type="number" [(ngModel)]="receivedCash"
                   class="w-32 py-1 px-2.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-600" />
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span class="font-semibold text-slate-600">Vuelto a entregar</span>
            <span class="font-mono font-black text-sm" [ngClass]="changeAmount() >= 0 ? 'text-emerald-700' : 'text-rose-600'">
              S/ {{ changeAmount() | number:'1.2-2' }}
            </span>
          </div>
        </div>
      } @else {
        <div>
          <label class="text-[11px] font-bold text-slate-500 uppercase">N° Operación / Constancia</label>
          <input type="text" [(ngModel)]="opCode" placeholder="Ej: 9812480"
                 class="w-full mt-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600" />
        </div>
      }

      <!-- Botón de Acción Principal -->
      <button type="button" (click)="onProcessSale()"
              [disabled]="isSubmitting() || !!blockingErrorMessage() || (selectedMethod() === 'CASH' && changeAmount() < 0)"
              class="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
        <span>Procesar Venta & Emitir</span>
        <kbd class="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-200 rounded font-mono">F8</kbd>
      </button>
    </div>
  `
})
export class CheckoutPaymentFormComponent {
  totalAmount = input.required<number>();
  customerDocument = input<string>('');
  sunatEnabled = input<boolean>(false);
  hasStockError = input<boolean>(false);
  isSubmitting = input<boolean>(false);

  toggleSunat = output<void>();
  submitPayment = output<{
    type: InvoiceType;
    method: PaymentMethod;
    receivedAmount?: number;
    changeAmount?: number;
    operationCode?: string;
  }>();

  selectedType = signal<InvoiceType>('BOLETA');
  selectedMethod = signal<PaymentMethod>('CASH');
  receivedCash = signal<number>(0);
  opCode = signal<string>('');

  paymentMethods: { id: PaymentMethod; label: string; sub: string }[] = [
    { id: 'CASH', label: 'Efectivo', sub: 'Calcula vuelto' },
    { id: 'CARD_POS', label: 'Tarjeta POS', sub: 'Izipay / Niubiz' },
    { id: 'BANK_TRANSFER', label: 'Transferencia', sub: 'BCP / BBVA / Interbank' },
    { id: 'YAPE_PLIN', label: 'Yape / Plin', sub: 'Billetera digital' }
  ];

  changeAmount = computed(() => {
    return Number((this.receivedCash() - this.totalAmount()).toFixed(2));
  });

  blockingErrorMessage = computed(() => {
    // 1. Bloqueo prioritario por stock insuficiente en algún lote
    if (this.hasStockError()) {
      return 'Existen repuestos con stock insuficiente en el proveedor seleccionado. Ajusta el lote antes de cobrar.';
    }

    const type = this.selectedType();
    const doc = (this.customerDocument() || '').trim();
    const isComodin = !doc || doc === '00000000' || doc === '-';
    const total = this.totalAmount();

    // 2. Si es Nota de Venta (Ticket Rápido), no aplican restricciones tributarias
    if (type === 'NOTA_VENTA') {
      return null;
    }

    // 3. Si el modo SUNAT está apagado y no es Factura, permite emitir como interno
    if (!this.sunatEnabled() && type !== 'FACTURA') {
      return null;
    }

    if (type === 'FACTURA' && (isComodin || doc.length !== 11)) {
      return 'Para emitir Factura es obligatorio reasignar un cliente con RUC (11 dígitos).';
    }

    if (type === 'BOLETA' && this.sunatEnabled() && total >= 700 && (isComodin || doc.length < 8)) {
      return `SUNAT exige DNI/identificación para Boletas de S/ 700.00 o más. Reasigna el cliente.`;
    }

    return null;
  });

  onProcessSale() {
    if (this.blockingErrorMessage()) return;

    this.submitPayment.emit({
      type: this.selectedType(),
      method: this.selectedMethod(),
      receivedAmount: this.selectedMethod() === 'CASH' ? this.receivedCash() : undefined,
      changeAmount: this.selectedMethod() === 'CASH' ? this.changeAmount() : undefined,
      operationCode: this.selectedMethod() !== 'CASH' ? this.opCode() : undefined,
    });
  }
}