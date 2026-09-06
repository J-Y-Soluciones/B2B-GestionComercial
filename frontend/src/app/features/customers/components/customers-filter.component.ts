import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-customers-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="relative w-full md:w-96">
        <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
          placeholder="Buscar por DNI (8), RUC (11) o Razón Social..."
          class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
        </svg>
      </div>
      <span class="text-xs text-slate-500 font-mono">
        {{ isLoading() ? 'Buscando...' : totalCount() + ' cuentas registradas' }}
      </span>
    </div>
  `
})
export class CustomersFilterComponent {
    searchQuery = input.required<string>();
    isLoading = input<boolean>(false);
    totalCount = input.required<number>();

    searchChange = output<string>();
}