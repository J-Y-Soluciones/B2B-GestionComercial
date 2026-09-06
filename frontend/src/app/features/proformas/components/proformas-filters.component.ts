import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface StatusTab {
    key: string;
    label: string;
    count: number;
    icon?: string;
}

@Component({
    selector: 'app-proformas-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-3 pt-1">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          @for (tab of tabs(); track tab.key) {
            <button type="button" (click)="statusChange.emit(tab.key)"
              [class]="selectedStatus() === tab.key 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
              class="px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5">
              @if (tab.icon) { <span>{{ tab.icon }}</span> }
              <span>{{ tab.label }}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full"
                [class]="selectedStatus() === tab.key ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'">
                {{ tab.count }}
              </span>
            </button>
          }
        </div>

        <label class="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input type="checkbox" [ngModel]="onlyTier3()" (ngModelChange)="tier3Toggle.emit($event)"
            class="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500" />
          <span>Ver solo con descuento T3 Especial</span>
        </label>
      </div>

      <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-2.5">
        <div class="relative flex-1 w-full">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
            placeholder="Buscar por correlativo (PROF-2026-XXXX), RUC, razón social..."
            class="w-full text-xs bg-slate-50/60 border border-slate-300 rounded-xl pl-9 pr-14 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
          <kbd class="absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">Ctrl+K</kbd>
        </div>
      </div>
    </div>
  `
})
export class ProformasFiltersComponent {
    tabs = input.required<StatusTab[]>();
    selectedStatus = input.required<string>();
    searchQuery = input.required<string>();
    onlyTier3 = input.required<boolean>();

    statusChange = output<string>();
    searchChange = output<string>();
    tier3Toggle = output<boolean>();
}