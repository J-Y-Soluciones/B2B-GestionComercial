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
      <!-- MÓVIL (< md): Dropdown interactivo con contador rápido -->
      <div class="block md:hidden">
        <div class="relative bg-white rounded-xl border border-slate-200 shadow-2xs">
          <label class="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 pt-2">
            Línea / Categoría Activa
          </label>
          <select 
            [ngModel]="selectedCategory()" 
            (ngModelChange)="categoryChange.emit($event)"
            class="w-full bg-transparent px-3 py-2 text-xs font-bold text-slate-900 outline-none appearance-none cursor-pointer">
            @for (line of categories(); track line.name) {
              <option [value]="line.name">
                {{ line.name }} ({{ line.count }} repuestos)
              </option>
            }
          </select>
          <div class="absolute right-3.5 bottom-3 pointer-events-none text-slate-400 text-xs font-bold">
            ▼
          </div>
        </div>
      </div>

      <!-- ESCRITORIO / TABLET (>= md): Píldoras clásicas con scroll suave -->
      <div class="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
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

      <!-- Buscador Unificado -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div class="relative w-full sm:w-96">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
            placeholder="Buscar SKU, OEM, descripción o marca..."
            class="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-12 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none font-sans" />
          <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
          <kbd class="hidden sm:inline-block absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">CTRL+K</kbd>
        </div>

        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto text-[11px] text-slate-500 font-mono">
          <span>{{ totalFiltered() }} repuestos encontrados</span>
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