import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 my-auto text-center">
        <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900">¿Eliminar Cliente?</h3>
          <p class="text-xs text-slate-500 mt-1">
            Se dará de baja del directorio a <span class="font-bold text-slate-800">{{ customer()?.name }}</span>.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button type="button" (click)="cancel.emit()"
            class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="button" (click)="confirm.emit()"
            class="flex-1 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors">
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerDeleteModalComponent {
  customer = input<Customer | null>(null);
  cancel = output<void>();
  confirm = output<void>();
}