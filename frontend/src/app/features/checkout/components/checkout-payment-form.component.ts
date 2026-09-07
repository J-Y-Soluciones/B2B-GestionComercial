import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { InvoiceType, PaymentMethod } from '../../../core/models/sale.model';

@Component({
  selector: 'app-checkout-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4 lg:sticky lg:top-4">
      <!-- Switch Sincronización Fiscal -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-xs font-bold text-slate-900 block">Sincronización OSE / SUNAT</span>
          <span class="text-[10px] text-slate-500 font-mono">
            {{ sunatEnabled() ? 'Timbrado electrónico activo' : 'Modo Interno (Nota de Venta)' }}
          </span>
        </div>
        <button type="button" (click)="toggleSunat.emit()"
          [class]="sunatEnabled() ? 'bg-emerald-700' : 'bg-slate-300'"
          class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none">
          <span [class.translate-x-5]="sunatEnabled()" class="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out"></span>
        </button>
      </div>

      <!-- Tipo de Comprobante -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Tipo de Comprobante</label>
        <div class="grid grid-cols-3 gap-1.5">
          <!-- Boleta -->
          <button type="button" 
            (click)="selectedType.set('BOLETA')"
            [disabled]="!sunatEnabled() || isRucCustomer()"
            [title]="isRucCustomer() ? 'Cliente con RUC requiere Factura' : (!sunatEnabled() ? 'Active modo SUNAT para emitir boletas' : '')"
            [ngClass]="{
              'bg-emerald-900 text-white font-bold shadow-2xs': selectedType() === 'BOLETA',
              'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer': selectedType() !== 'BOLETA' && sunatEnabled() && !isRucCustomer(),
              'bg-slate-50 text-slate-300 border border-slate-100 opacity-40 cursor-not-allowed': !sunatEnabled() || isRucCustomer()
            }"
            class="py-2 px-1 rounded-lg text-xs font-mono transition-all text-center">
            Boleta (B001)
          </button>

          <!-- Factura -->
          <button type="button" 
            (click)="selectedType.set('FACTURA')"
            [disabled]="!sunatEnabled()"
            [title]="!sunatEnabled() ? 'Active modo SUNAT para emitir facturas' : ''"
            [ngClass]="{
              'bg-emerald-900 text-white font-bold shadow-2xs': selectedType() === 'FACTURA',
              'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer': selectedType() !== 'FACTURA' && sunatEnabled(),
              'bg-slate-50 text-slate-300 border border-slate-100 opacity-40 cursor-not-allowed': !sunatEnabled()
            }"
            class="py-2 px-1 rounded-lg text-xs font-mono transition-all text-center">
            Factura (F001)
          </button>

          <!-- Ticket Rápido -->
          <button type="button" 
            (click)="selectedType.set('NOTA_VENTA')"
            [ngClass]="selectedType() === 'NOTA_VENTA' ? 'bg-emerald-900 text-white font-bold shadow-2xs' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer'"
            class="py-2 px-1 rounded-lg text-xs font-mono transition-all text-center">
            Ticket (NV01)
          </button>
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
        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Medio de Pago</label>
        <div class="grid grid-cols-2 gap-2">
          @for (m of paymentMethods; track m.id) {
            <button type="button" (click)="selectedMethod.set(m.id)"
              [ngClass]="selectedMethod() === m.id ? 'border-emerald-700 bg-emerald-50/60 text-emerald-950 font-bold ring-1 ring-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
              class="p-2.5 border rounded-xl text-left text-xs transition-all cursor-pointer">
              <span class="block text-xs font-bold leading-tight">{{ m.label }}</span>
              <span class="text-[10px] text-slate-400 font-mono block mt-0.5">{{ m.sub }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Efectivo / Vuelto -->
      @if (selectedMethod() === 'CASH') {
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <label class="font-bold text-slate-700">Monto Recibido</label>
            <input type="number" [ngModel]="receivedCash()" (ngModelChange)="receivedCash.set($event)"
              class="w-28 py-1 px-2 text-right font-mono font-bold bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-700" />
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span class="font-semibold text-slate-600">Vuelto a entregar</span>
            <span class="font-mono font-black text-sm" [ngClass]="changeAmount() >= 0 ? 'text-emerald-800' : 'text-rose-600'">
              S/ {{ changeAmount() | number:'1.2-2' }}
            </span>
          </div>
        </div>
      } @else {
        <div>
          <label class="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">N° Operación / Constancia</label>
          <input type="text" [ngModel]="opCode()" (ngModelChange)="opCode.set($event)" placeholder="Ej: 9812480"
            class="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-700 font-mono" />
        </div>
      }

      <!-- Botón Procesar Venta -->
      <button type="button" (click)="onProcessSale()"
        [disabled]="isSubmitting() || !!blockingErrorMessage() || (selectedMethod() === 'CASH' && changeAmount() < 0)"
        class="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
        <span>Procesar Venta &amp; Emitir</span>
        <kbd class="hidden md:inline-block px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-200 rounded font-mono">F8</kbd>
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

  selectedType = signal<InvoiceType>('NOTA_VENTA');
  selectedMethod = signal<PaymentMethod>('CASH');
  receivedCash = signal<number>(0);
  opCode = signal<string>('');

  paymentMethods: { id: PaymentMethod; label: string; sub: string }[] = [
    { id: 'CASH', label: 'Efectivo', sub: 'Calcula vuelto' },
    { id: 'CARD_POS', label: 'Tarjeta POS', sub: 'Izipay / Niubiz' },
    { id: 'BANK_TRANSFER', label: 'Transferencia', sub: 'BCP / BBVA / Interbank' },
    { id: 'YAPE_PLIN', label: 'Yape / Plin', sub: 'Billetera digital' }
  ];

  isRucCustomer = computed(() => {
    const doc = (this.customerDocument() || '').trim();
    return doc.length === 11;
  });

  constructor() {
    effect(() => {
      const isSunat = this.sunatEnabled();
      const isRuc = this.isRucCustomer();

      if (!isSunat) {
        this.selectedType.set('NOTA_VENTA');
      } else if (isRuc) {
        this.selectedType.set('FACTURA');
      } else {
        this.selectedType.set('BOLETA');
      }
    });
  }

  changeAmount = computed(() => {
    return Number((this.receivedCash() - this.totalAmount()).toFixed(2));
  });

  blockingErrorMessage = computed(() => {
    if (this.hasStockError()) {
      return 'Existen repuestos con stock insuficiente en el proveedor seleccionado. Ajusta el lote antes de cobrar.';
    }

    const type = this.selectedType();
    const doc = (this.customerDocument() || '').trim();
    const isComodin = !doc || doc === '00000000' || doc === '-';
    const total = this.totalAmount();

    if (type === 'NOTA_VENTA') {
      return null;
    }

    if (type === 'FACTURA' && (isComodin || doc.length !== 11)) {
      return 'Para emitir Factura es obligatorio asignar un cliente con RUC (11 dígitos).';
    }

    if (type === 'BOLETA' && this.sunatEnabled() && total >= 700 && (isComodin || doc.length < 8)) {
      return 'SUNAT exige DNI/identificación para Boletas de S/ 700.00 o más. Reasigna el cliente.';
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