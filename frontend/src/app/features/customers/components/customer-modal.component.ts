import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Customer, CreateCustomerPayload } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header Fijo -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              {{ customer() ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente' }}
            </h3>
            <p class="text-[10px] text-slate-400">Configuración de cuenta fiscal para facturación</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Formulario Scrolleable -->
        <form (ngSubmit)="onSubmit()" class="flex-1 flex flex-col overflow-hidden">
          <div class="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
            @if (errorMessage() || serverError()) {
              <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium flex items-center gap-2">
                <span class="font-bold text-sm">⚠️</span>
                <span>{{ errorMessage() || serverError() }}</span>
              </div>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo Fiscal</label>
                <select [(ngModel)]="formType" name="type" (change)="onTypeChange()"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 text-slate-800">
                  <option value="NATURAL">DNI (8 dígitos) - Boleta</option>
                  <option value="BUSINESS">RUC (11 dígitos) - Factura</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  N° Documento ({{ formType === 'BUSINESS' ? '11 dígitos' : '8 dígitos' }}) *
                </label>
                <input type="text" [(ngModel)]="formDoc" name="doc" [maxLength]="formType === 'BUSINESS' ? 11 : 8"
                  placeholder="Ej. 20123456789" required
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 font-mono font-bold text-slate-900" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Razón Social / Nombre Completo *</label>
              <input type="text" [(ngModel)]="formName" name="name" placeholder="Ej. Transportes del Pacífico SAC" required
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 text-slate-900" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono / WhatsApp</label>
                <input type="text" [(ngModel)]="formPhone" name="phone" placeholder="999888777"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 font-mono text-slate-800" />
              </div>
              <div>
                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input type="email" [(ngModel)]="formEmail" name="email" placeholder="contacto@empresa.pe"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 text-slate-800" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Dirección Fiscal</label>
              <input type="text" [(ngModel)]="formAddress" name="address" placeholder="Av. Nicolás de Piérola 1234, Lima"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-emerald-700 text-slate-800" />
            </div>
          </div>

          <!-- Footer Fijo -->
          <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
            <button type="button" (click)="close.emit()"
              class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
              Cancelar
            </button>
            <button type="submit" [disabled]="isSaving()"
              class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-colors">
              {{ isSaving() ? 'Guardando...' : (customer() ? 'Actualizar Cliente' : 'Guardar Cliente') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerModalComponent {
  customer = input<Customer | null>(null);
  isSaving = input<boolean>(false);
  serverError = input<string | null>(null);

  close = output<void>();
  save = output<{ id?: string; payload: CreateCustomerPayload }>();

  formType: 'NATURAL' | 'BUSINESS' = 'NATURAL';
  formDoc = '';
  formName = '';
  formPhone = '';
  formEmail = '';
  formAddress = '';
  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const c = this.customer();
      if (c) {
        this.formType = c.type;
        this.formDoc = c.documentNumber;
        this.formName = c.name;
        this.formPhone = c.phone || '';
        this.formEmail = c.email || '';
        this.formAddress = c.address || '';
      } else {
        this.formType = 'NATURAL';
        this.formDoc = '';
        this.formName = '';
        this.formPhone = '';
        this.formEmail = '';
        this.formAddress = '';
      }
      this.errorMessage.set(null);
    });
  }

  onTypeChange(): void {
    if (this.formType === 'NATURAL' && this.formDoc.length > 8) {
      this.formDoc = this.formDoc.substring(0, 8);
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    const doc = this.formDoc.trim();

    if (this.formType === 'NATURAL') {
      if (doc.length !== 8) {
        this.errorMessage.set('El DNI debe tener exactamente 8 dígitos.');
        return;
      }
    }

    if (this.formType === 'BUSINESS') {
      if (doc.length !== 11) {
        this.errorMessage.set('El RUC debe tener exactamente 11 dígitos.');
        return;
      }
    }

    if (!this.formName.trim()) {
      this.errorMessage.set('El nombre o razón social es obligatorio.');
      return;
    }

    this.save.emit({
      id: this.customer()?.id,
      payload: {
        type: this.formType,
        documentNumber: doc,
        name: this.formName.trim(),
        phone: this.formPhone.trim() || undefined,
        email: this.formEmail.trim() || undefined,
        address: this.formAddress.trim() || undefined,
      }
    });
  }
}