import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
      <div class="relative w-full sm:w-96">
        <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
          placeholder="Buscar por DNI (8), RUC (11) o Razón Social..."
          class="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-12 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
        <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
        </svg>
        <kbd class="hidden sm:inline-block absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">Ctrl+K</kbd>
      </div>
      <span class="text-[11px] text-slate-500 font-mono self-end sm:self-auto">
        {{ isLoading() ? 'Consultando...' : totalCount() + ' cuentas registradas' }}
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