import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersApiService } from '../../../core/api/customers-api.service';
import { CustomerModalComponent } from '../../customers/components/customer-modal.component';
import type { Customer, CreateCustomerPayload } from '../../../core/models/customer.model';

@Component({
  selector: 'app-checkout-customer-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerModalComponent],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header Fijo -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xs font-bold text-slate-900">Reasignar / Identificar Cliente</h3>
            <p class="text-[10px] text-slate-400">Asigna el titular fiscal para la emisión</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Body Scrolleable -->
        <div class="p-4 space-y-3 text-xs overflow-y-auto flex-1">
          <!-- Búsqueda -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
                     placeholder="Buscar por DNI, RUC o Razón Social..."
                     class="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700" />
              @if (isSearching()) {
                <span class="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono animate-pulse">Buscando...</span>
              }
            </div>

            <button type="button" (click)="openCreateModal()"
                    class="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0">
              <span>+ Nuevo</span>
            </button>
          </div>

          <!-- Resultados -->
          <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            @if (results().length === 0 && !isSearching()) {
              <div class="p-6 text-center text-slate-400 text-xs">
                {{ searchQuery.trim() ? 'No se encontraron clientes con esos datos.' : 'Ingresa un DNI, RUC o Nombre para buscar.' }}
              </div>
            }

            @for (c of results(); track c.id) {
              <div class="p-3 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 truncate">{{ c.name }}</p>
                  <p class="text-[11px] text-slate-500 font-mono">
                    {{ c.documentNumber }} &bull; 
                    <span [class]="c.type === 'BUSINESS' ? 'text-blue-700 font-bold' : 'text-emerald-700 font-bold'">
                      {{ c.type === 'BUSINESS' ? 'RUC (Factura)' : 'DNI (Boleta)' }}
                    </span>
                  </p>
                </div>
                <button type="button" (click)="selectAndEmit(c)"
                        class="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer transition-colors shrink-0">
                  Seleccionar
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Footer Fijo -->
        <div class="p-3 bg-slate-50/50 border-t border-slate-100 text-right shrink-0">
          <button type="button" (click)="close.emit()" class="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold rounded-lg cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hijo para Registro In-situ -->
    @if (showCreateCustomer()) {
      <app-customer-modal
        [isSaving]="isCreatingCustomer()"
        [serverError]="createError()"
        (close)="showCreateCustomer.set(false)"
        (save)="handleCreateCustomer($event)" />
    }
  `
})
export class CheckoutCustomerPickerModalComponent {
  private readonly customersApi = inject(CustomersApiService);

  close = output<void>();
  customerSelected = output<Customer>();

  searchQuery = '';
  isSearching = signal<boolean>(false);
  results = signal<Customer[]>([]);

  showCreateCustomer = signal<boolean>(false);
  isCreatingCustomer = signal<boolean>(false);
  createError = signal<string | null>(null);

  onSearchChange(term: string): void {
    const q = term ? term.trim() : '';
    if (q.length < 2) {
      this.results.set([]);
      return;
    }

    this.isSearching.set(true);
    this.customersApi.search(q, 6).subscribe({
      next: (res) => {
        const filtered = res.filter(c => c.documentNumber !== '00000000');
        this.results.set(filtered);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  selectAndEmit(customer: Customer): void {
    this.customerSelected.emit(customer);
    this.close.emit();
  }

  openCreateModal(): void {
    this.createError.set(null);
    this.showCreateCustomer.set(true);
  }

  handleCreateCustomer(event: { id?: string; payload: CreateCustomerPayload }): void {
    this.isCreatingCustomer.set(true);
    this.createError.set(null);

    this.customersApi.create(event.payload).subscribe({
      next: (created) => {
        this.isCreatingCustomer.set(false);
        this.showCreateCustomer.set(false);
        this.selectAndEmit(created);
      },
      error: (err) => {
        this.isCreatingCustomer.set(false);
        this.createError.set(err?.error?.message || 'Error al registrar cliente.');
      }
    });
  }
}