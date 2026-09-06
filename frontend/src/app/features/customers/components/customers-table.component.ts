import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Customer } from '../../../core/models/customer.model';

@Component({
    selector: 'app-customers-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
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
                <td colspan="6" class="py-10 text-center text-slate-400 text-xs">
                  No se encontraron clientes registrados.
                </td>
              </tr>
            }

            @for (c of customers(); track c.id) {
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono font-bold text-slate-800">{{ c.documentNumber }}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-900">{{ c.name }}</td>
                <td class="py-3.5 px-4">
                  <span [class]="c.type === 'BUSINESS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border">
                    {{ c.type === 'BUSINESS' ? 'RUC • Factura' : 'DNI • Boleta' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-600">
                  <div>{{ c.phone || 'Sin teléfono' }}</div>
                  <div class="text-[11px] text-slate-400 truncate max-w-[180px]">{{ c.email || 'Sin correo' }}</div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 truncate max-w-[220px]">{{ c.address || '—' }}</td>
                <td class="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                  <button type="button" (click)="edit.emit(c)"
                    class="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-emerald-50">
                    Editar
                  </button>
                  @if (canDelete()) {
                    <button type="button" (click)="delete.emit(c)"
                      class="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-rose-50">
                      Eliminar
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
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