// frontend/src/app/features/customers/components/customer-modal.component.ts
import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Customer, CreateCustomerPayload } from '../../../core/models/customer.model';

@Component({
    selector: 'app-customer-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900">
            {{ customer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente' }}
          </h3>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">&times;</button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4 text-xs">
          @if (errorMessage() || serverError) {
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium flex items-center gap-2">
              <span class="font-bold">⚠️</span>
              <span>{{ errorMessage() || serverError }}</span>
            </div>
          }

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tipo Fiscal</label>
              <select [(ngModel)]="formType" name="type" (change)="onTypeChange()"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="NATURAL">Persona Natural (DNI)</option>
                <option value="BUSINESS">Persona Jurídica (RUC)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Documento ({{ formType === 'BUSINESS' ? '11 dígitos' : '8 dígitos' }})
              </label>
              <input type="text" [(ngModel)]="formDoc" name="doc" [maxLength]="formType === 'BUSINESS' ? 11 : 8"
                placeholder="Ej. 20123456789" required
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Razón Social / Nombre Completo</label>
            <input type="text" [(ngModel)]="formName" name="name" placeholder="Ej. Transportes del Pacífico SAC" required
              class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input type="text" [(ngModel)]="formPhone" name="phone" placeholder="999888777"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input type="email" [(ngModel)]="formEmail" name="email" placeholder="contacto@empresa.pe"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Dirección Fiscal</label>
            <input type="text" [(ngModel)]="formAddress" name="address" placeholder="Av. Nicolás de Piérola 1234, Lima"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" (click)="close.emit()"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer">
              Cancelar
            </button>
            <button type="submit" [disabled]="isSaving"
              class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-lg cursor-pointer shadow-xs">
              {{ isSaving ? 'Guardando...' : (customer ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerModalComponent implements OnChanges {
    @Input() customer: Customer | null = null;
    @Input() isSaving = false;
    @Input() serverError: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ id?: string; payload: CreateCustomerPayload }>();

    formType: 'NATURAL' | 'BUSINESS' = 'NATURAL';
    formDoc = '';
    formName = '';
    formPhone = '';
    formEmail = '';
    formAddress = '';
    errorMessage = signal<string | null>(null);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['customer'] && this.customer) {
            this.formType = this.customer.type;
            this.formDoc = this.customer.documentNumber;
            this.formName = this.customer.name;
            this.formPhone = this.customer.phone || '';
            this.formEmail = this.customer.email || '';
            this.formAddress = this.customer.address || '';
        }
    }

    onTypeChange(): void {
        if (this.formType === 'NATURAL' && this.formDoc.length > 8) {
            this.formDoc = this.formDoc.substring(0, 8);
        }
    }

    onSubmit(): void {
        this.errorMessage.set(null);
        const doc = this.formDoc.trim();

        if (this.formType === 'NATURAL' && doc.length !== 8) {
            this.errorMessage.set('El DNI debe tener exactamente 8 dígitos.');
            return;
        }
        if (this.formType === 'BUSINESS' && doc.length !== 11) {
            this.errorMessage.set('El RUC debe tener exactamente 11 dígitos.');
            return;
        }
        if (!this.formName.trim()) {
            this.errorMessage.set('El nombre o razón social es obligatorio.');
            return;
        }

        this.save.emit({
            id: this.customer?.id,
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