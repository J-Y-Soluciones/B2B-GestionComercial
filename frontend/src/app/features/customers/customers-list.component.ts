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
      <app-customers-filter 
        [searchQuery]="searchQuery()" 
        [isLoading]="isLoading()" 
        [totalCount]="customers().length" 
        (searchChange)="onSearchChange($event)" />

      <!-- Tabla -->
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