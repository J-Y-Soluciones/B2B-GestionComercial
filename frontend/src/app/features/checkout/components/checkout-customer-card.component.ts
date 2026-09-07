import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-customer-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-3">
          <span class="font-mono text-base font-black text-slate-900">{{ proformaCode() }}</span>
          @if (isApproved()) {
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              Aprobada
            </span>
          }
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-[11px] text-slate-400 block font-medium">FECHA DE EMISIÓN</span>
            <span class="text-xs font-mono font-semibold text-slate-700">{{ issuedAt() | date:'dd MMM yyyy - HH:mm' }}</span>
          </div>
          <button type="button" (click)="openCustomerSearch.emit()"
                  class="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer shadow-2xs">
            🔄 Reasignar Cliente
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-[11px] text-slate-400 block font-semibold uppercase">Razón Social & Titular</span>
          <span class="text-sm font-bold text-slate-900 block mt-0.5">{{ customerName() }}</span>
          <span class="text-slate-500 block text-[11px] mt-0.5">{{ customerAddress() || 'Sin dirección fiscal registrada' }}</span>
        </div>
        <div class="md:text-right">
          <span class="text-[11px] text-slate-400 block font-semibold uppercase">Documento / Identificación</span>
          <span class="text-sm font-mono font-bold text-slate-900 block mt-0.5">{{ documentNumber() }}</span>
          @if (isComodin()) {
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 mt-1">
              ⚠️ Comodín Mostrador (Sin RUC/DNI)
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
              ● Documento Identificado
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class CheckoutCustomerCardComponent {
  proformaCode = input.required<string>();
  isApproved = input<boolean>(true);
  issuedAt = input<Date | string>(new Date());
  customerName = input.required<string>();
  documentNumber = input.required<string>();
  customerAddress = input<string | undefined>();
  openCustomerSearch = output<void>();

  isComodin(): boolean {
    const doc = this.documentNumber();
    return !doc || doc === '00000000' || doc === '-';
  }
}