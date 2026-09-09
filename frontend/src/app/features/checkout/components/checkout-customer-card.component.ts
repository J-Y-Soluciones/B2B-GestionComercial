import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-customer-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3.5">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="font-mono text-sm sm:text-base font-black text-slate-900">{{ proformaCode() }}</span>
          @if (isApproved()) {
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Aprobada
            </span>
          }
        </div>
        
        <div class="flex items-center gap-2">
          <div class="text-right hidden sm:block">
            <span class="text-[9px] text-slate-400 block font-mono font-bold uppercase">Emisión</span>
            <span class="text-[11px] font-mono font-semibold text-slate-600">{{ issuedAt() | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <button type="button" (click)="openCustomerSearch.emit()"
            class="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1">
            <span>🔄</span> Reasignar Cliente
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="space-y-0.5">
          <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Titular / Razón Social</span>
          <span class="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">{{ customerName() }}</span>
          <span class="text-slate-500 block text-[11px] truncate">{{ customerAddress() || 'Sin dirección fiscal registrada' }}</span>
        </div>

        <div class="sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Documento Identidad</span>
          <span class="text-xs sm:text-sm font-mono font-bold text-slate-900 block">{{ documentNumber() }}</span>
          @if (isComodin()) {
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
              ⚠️ Comodín Mostrador (Sin RUC/DNI)
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              ● Identificación Validada
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