import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-users-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-96">
        <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchChange.emit($event)"
          placeholder="Buscar por nombre o correo corporativo..."
          class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
        </svg>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select [ngModel]="selectedRole()" (ngModelChange)="roleChange.emit($event)"
          class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 cursor-pointer">
          <option value="ALL">Todos los Cargos</option>
          <option value="ADMIN">Administrador</option>
          <option value="MANAGER">Gerente</option>
          <option value="SELLER">Ventas</option>
          <option value="WAREHOUSE">Almacén</option>
        </select>
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