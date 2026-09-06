import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersApiService } from '../../core/services/customers-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomerModalComponent } from './components/customer-modal.component';
import type { Customer, CreateCustomerPayload } from '../../core/models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerModalComponent],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-base font-bold text-slate-900">Cartera de Clientes & Cuentas RUC</h2>
          <p class="text-xs text-slate-500 mt-0.5">Gestión de cuentas para emisión de Boletas y Facturas electrónicas.</p>
        </div>
        <button type="button" (click)="openModal()"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer shadow-xs shrink-0 transition-colors">
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      <!-- Buscador -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="relative w-full md:w-96">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar por DNI (8), RUC (11) o Razón Social..."
            class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <span class="text-xs text-slate-500 font-mono">
          {{ isLoading() ? 'Buscando...' : customers().length + ' cuentas registradas' }}
        </span>
      </div>

      <!-- Tabla -->
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
                    <button type="button" (click)="openModal(c)"
                      class="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-emerald-50">
                      Editar
                    </button>
                    @if (canDelete()) {
                      <button type="button" (click)="askDelete(c)"
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

      <!-- Modal Crear / Editar -->
      @if (showModal()) {
        <app-customer-modal
          [customer]="selectedCustomer()"
          [isSaving]="isSaving()"
          [serverError]="serverErrorMessage()"
          (close)="showModal.set(false)"
          (save)="handleSave($event)" />
      }

      <!-- Modal Confirmación Eliminación -->
      @if (customerToDelete()) {
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-lg font-bold">
              !
            </div>
            <div class="text-center space-y-1">
              <h3 class="text-sm font-bold text-slate-900">¿Eliminar Cliente?</h3>
              <p class="text-xs text-slate-500">
                Se eliminará permanentemente a <span class="font-bold text-slate-800">{{ customerToDelete()?.name }}</span>.
              </p>
            </div>
            <div class="flex items-center gap-2 pt-2">
              <button type="button" (click)="customerToDelete.set(null)"
                class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
                Cancelar
              </button>
              <button type="button" (click)="executeDelete()"
                class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CustomersListComponent implements OnInit {
  private readonly customersApi = inject(CustomersApiService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  customers = signal<Customer[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  searchQuery = signal('');

  showModal = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  customerToDelete = signal<Customer | null>(null);
  serverErrorMessage = signal<string | null>(null);

  canDelete = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.customersApi.search(this.searchQuery(), 30).subscribe({
      next: (res) => {
        this.customers.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.loadCustomers();
  }

  openModal(customer?: Customer): void {
    this.selectedCustomer.set(customer || null);
    this.serverErrorMessage.set(null);
    this.showModal.set(true);
  }

  handleSave(event: { id?: string; payload: CreateCustomerPayload }): void {
    this.isSaving.set(true);
    this.serverErrorMessage.set(null);

    const request = event.id
      ? this.customersApi.update(event.id, event.payload)
      : this.customersApi.create(event.payload);

    request.subscribe({
      next: (saved) => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.toast.show(`Cliente "${saved.name}" guardado con éxito`, 'success');
        this.searchQuery.set('');
        this.loadCustomers();
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || 'Error al procesar la solicitud.';
        this.serverErrorMessage.set(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    });
  }

  askDelete(customer: Customer): void {
    this.customerToDelete.set(customer);
  }

  executeDelete(): void {
    const target = this.customerToDelete();
    if (!target) return;

    this.customersApi.delete(target.id).subscribe({
      next: () => {
        this.customerToDelete.set(null);
        this.toast.show(`Cliente "${target.name}" eliminado`, 'info');
        this.loadCustomers();
      },
      error: (err) => {
        this.customerToDelete.set(null);
        const msg = err?.error?.message || 'No se pudo eliminar el cliente.';
        this.toast.show(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
      }
    });
  }
}