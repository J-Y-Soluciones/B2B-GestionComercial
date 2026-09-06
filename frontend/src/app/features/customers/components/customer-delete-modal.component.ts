import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Customer } from '../../../core/models/customer.model';

@Component({
    selector: 'app-customer-delete-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden p-6 space-y-4">
        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-lg font-bold">
          !
        </div>
        <div class="text-center space-y-1">
          <h3 class="text-sm font-bold text-slate-900">¿Eliminar Cliente?</h3>
          <p class="text-xs text-slate-500">
            Se eliminará permanentemente a <span class="font-bold text-slate-800">{{ customer()?.name }}</span>.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button type="button" (click)="cancel.emit()"
            class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
            Cancelar
          </button>
          <button type="button" (click)="confirm.emit()"
            class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs">
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