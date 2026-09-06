import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CategoryLine {
    name: string;
    count: number;
}

@Component({
    selector: 'app-catalog-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-3">
      <!-- Píldoras de Categorías -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        @for (line of categories(); track line.name) {
          <button type="button" (click)="categoryChange.emit(line.name)"
            [class]="selectedCategory() === line.name 
              ? 'bg-emerald-900 text-white font-bold shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5">
            <span>{{ line.name }}</span>
            <span class="text-[10px] font-mono opacity-80" [class]="selectedCategory() === line.name ? 'text-emerald-200' : 'text-slate-400'">
              {{ line.count }}
            </span>
          </button>
        }
      </div>

      <!-- Buscador -->
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-96">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
            placeholder="Buscar por SKU, Nº Parte OEM, Descripción o Marca..."
            class="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-14 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none font-sans" />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
          <kbd class="absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">CTRL+K</kbd>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto text-xs text-slate-500 font-mono">
          <span>Mostrando {{ totalFiltered() }} repuestos registrados</span>
        </div>
      </div>
    </div>
  `
})
export class CatalogFiltersComponent {
    categories = input.required<CategoryLine[]>();
    selectedCategory = input.required<string>();
    searchQuery = input.required<string>();
    totalFiltered = input.required<number>();

    categoryChange = output<string>();
    searchChange = output<string>();
}