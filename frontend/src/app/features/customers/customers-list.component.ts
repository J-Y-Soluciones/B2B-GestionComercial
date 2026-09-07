import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomersFilterComponent } from './components/customers-filter.component';
import { CustomersTableComponent } from './components/customers-table.component';
import { CustomerModalComponent } from './components/customer-modal.component';
import { CustomerDeleteModalComponent } from './components/customer-delete-modal.component';
import type { Customer, CreateCustomerPayload } from '../../core/models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    CustomersFilterComponent,
    CustomersTableComponent,
    CustomerModalComponent,
    CustomerDeleteModalComponent
  ],
  template: `
    <div class="space-y-4 sm:space-y-5 font-sans">
      <!-- HEADER ESTANDARIZADO -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            ALMACÉN &bull; MAESTROS &bull; DIRECTORIO FISCAL
          </div>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
              Cartera de Clientes &amp; Cuentas RUC
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Directorio B2B
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Gestión de titulares comerciales para emisión fiscal de Boletas y Facturas electrónicas.
          </p>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" (click)="openModal()"
            class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
            <span>+</span>
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <!-- Buscador -->
      <app-customers-filter 
        [searchQuery]="searchQuery()" 
        [isLoading]="isLoading()" 
        [totalCount]="customers().length" 
        (searchChange)="onSearchChange($event)" />

      <!-- Tabla / Cards Adaptables -->
      <app-customers-table 
        [customers]="customers()" 
        [isLoading]="isLoading()" 
        [canDelete]="canDelete()" 
        (edit)="openModal($event)" 
        (delete)="customerToDelete.set($event)" />

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
        <app-customer-delete-modal 
          [customer]="customerToDelete()" 
          (cancel)="customerToDelete.set(null)" 
          (confirm)="executeDelete()" />
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
    const query = this.searchQuery().trim();
    // Si query está vacío, pasamos string vacío para que el backend liste por defecto
    this.customersApi.search(query, 50).subscribe({
      next: (res) => {
        this.customers.set(res || []);
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

    const request$ = event.id
      ? this.customersApi.update(event.id, event.payload)
      : this.customersApi.create(event.payload);

    request$.subscribe({
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