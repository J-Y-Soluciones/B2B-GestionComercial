import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
      <!-- Input de búsqueda -->
      <div class="relative w-full sm:w-96">
        <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
          placeholder="Buscar por nombre o correo corporativo..."
          class="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-12 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
        <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
        </svg>
        <kbd class="hidden sm:inline-block absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">Ctrl+K</kbd>
      </div>

      <!-- Selector de Rol -->
      <div class="w-full sm:w-auto">
        <div class="relative">
          <select [ngModel]="selectedRole()" (ngModelChange)="roleChange.emit($event)"
            class="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 appearance-none pr-8 cursor-pointer">
            <option value="ALL">Todos los Cargos</option>
            <option value="ADMIN">Administrador</option>
            <option value="MANAGER">Gerente</option>
            <option value="SELLER">Ventas (Cotizador F2)</option>
            <option value="WAREHOUSE">Almacén Central</option>
          </select>
          <div class="absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-xs font-bold">
            ▼
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersFiltersComponent {
  searchQuery = input.required<string>();
  selectedRole = input.required<string>();

  searchChange = output<string>();
  roleChange = output<string>();
}