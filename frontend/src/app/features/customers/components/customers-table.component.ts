import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customers-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <!-- VISTA MÓVIL (< md): Cards compactas -->
      <div class="block md:hidden space-y-2.5">
        @if (customers().length === 0 && !isLoading()) {
          <div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 shadow-2xs">
            No se encontraron clientes registrados.
          </div>
        }

        @for (c of customers(); track c.id) {
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <span class="font-mono font-bold text-xs text-slate-900 block">{{ c.documentNumber }}</span>
                <h4 class="text-xs font-bold text-slate-800 leading-snug truncate mt-0.5">{{ c.name }}</h4>
              </div>
              <span [class]="c.type === 'BUSINESS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0">
                {{ c.type === 'BUSINESS' ? 'RUC • Factura' : 'DNI • Boleta' }}
              </span>
            </div>

            <div class="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2 font-mono">
              <div>📞 {{ c.phone || 'Sin teléfono' }}</div>
              <div class="truncate">✉ {{ c.email || 'Sin correo' }}</div>
              <div class="truncate text-slate-400">📍 {{ c.address || 'Sin dirección fiscal' }}</div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button type="button" (click)="edit.emit(c)"
                class="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer">
                Editar
              </button>
              @if (canDelete()) {
                <button type="button" (click)="delete.emit(c)"
                  class="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer">
                  Eliminar
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- VISTA ESCRITORIO (>= md): Tabla completa densa -->
      <div class="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
                <th class="py-3 px-4">Documento</th>
                <th class="py-3 px-4">Razón Social / Nombre</th>
                <th class="py-3 px-4">Tipo Fiscal</th>
                <th class="py-3 px-4">Contacto</th>
                <th class="py-3 px-4">Dirección Fiscal</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (customers().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              }

              @for (c of customers(); track c.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-4 font-mono font-black text-slate-800">{{ c.documentNumber }}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">{{ c.name }}</td>
                  <td class="py-3 px-4">
                    <span [class]="c.type === 'BUSINESS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border">
                      {{ c.type === 'BUSINESS' ? 'RUC • Factura' : 'DNI • Boleta' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-600">
                    <div class="font-medium text-slate-800">{{ c.phone || 'Sin teléfono' }}</div>
                    <div class="text-[10px] text-slate-400 truncate max-w-[180px] font-mono">{{ c.email || 'Sin correo' }}</div>
                  </td>
                  <td class="py-3 px-4 text-slate-600 truncate max-w-[220px]">{{ c.address || '—' }}</td>
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <div class="inline-flex items-center gap-1">
                      <button type="button" (click)="edit.emit(c)"
                        class="text-emerald-800 hover:text-emerald-950 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-emerald-50 transition-colors">
                        Editar
                      </button>
                      @if (canDelete()) {
                        <button type="button" (click)="delete.emit(c)"
                          class="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors">
                          Eliminar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CustomersTableComponent {
  customers = input.required<Customer[]>();
  isLoading = input<boolean>(false);
  canDelete = input<boolean>(false);

  edit = output<Customer>();
  delete = output<Customer>();
}