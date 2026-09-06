import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { UserItem } from '../../../core/api/users-api.service';

export interface UserFormData {
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SELLER' | 'WAREHOUSE';
  isActive: boolean;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
              👤
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">
                {{ isEditing() ? 'Editar Colaborador' : 'Nuevo Colaborador' }}
              </h3>
              <p class="text-[11px] text-slate-500 font-mono">
                {{ isEditing() ? form.email : 'Se generará una invitación segura para activación' }}
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <div class="p-6 space-y-5 text-xs">
          <!-- Nombre y Email -->
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Carlos Valdivia"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Corporativo</label>
              <input type="email" [(ngModel)]="form.email" placeholder="c.valdivia@vortexyolti.com"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <!-- Selector de Roles -->
          <div>
            <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Rol Asignado en el Sistema</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" (click)="form.role = 'ADMIN'"
                [class]="form.role === 'ADMIN' ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-1 ring-purple-500' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block font-bold text-xs">Administrador</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Control Total</span>
              </button>

              <button type="button" (click)="form.role = 'MANAGER'"
                [class]="form.role === 'MANAGER' ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block font-bold text-xs">Gerente</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Supervisión & T3</span>
              </button>

              <button type="button" (click)="form.role = 'SELLER'"
                [class]="form.role === 'SELLER' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block font-bold text-xs">Ventas</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Cotizador F2</span>
              </button>

              <button type="button" (click)="form.role = 'WAREHOUSE'"
                [class]="form.role === 'WAREHOUSE' ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-300 text-slate-600'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block font-bold text-xs">Almacén</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Kardex Físico</span>
              </button>
            </div>
          </div>

          <!-- Seguridad & Invitación -->
          <div class="pt-3 border-t border-slate-100 space-y-3">
            @if (!isEditing()) {
              <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <span class="text-emerald-700 text-sm">🔒</span>
                <div>
                  <div class="font-bold text-emerald-900 text-[11px]">Flujo de Invitación Segura</div>
                  <div class="text-[10px] text-emerald-700 mt-0.5">
                    No necesitas ingresar contraseñas. El sistema generará un enlace de activación seguro para que el colaborador defina su propia clave.
                  </div>
                </div>
              </div>
            } @else {
              <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">Seguridad de Acceso</div>
                  <div class="text-[10px] text-slate-500">Enviar enlace al correo corporativo</div>
                </div>
                <button type="button" (click)="requestReset.emit()"
                  class="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg cursor-pointer transition-colors shadow-xs">
                  📧 Reenviar Clave
                </button>
              </div>
            }

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs font-medium text-slate-700">Estado de Acceso:</span>
              <button type="button" (click)="form.isActive = !form.isActive"
                [class]="form.isActive ? 'bg-emerald-600' : 'bg-slate-300'"
                class="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5">
                <span [class]="form.isActive ? 'translate-x-5' : 'translate-x-0'"
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" (click)="close.emit()"
            class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="button" (click)="submitForm()" [disabled]="isSaving()"
            class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50 transition-colors">
            {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Guardar Cambios' : 'Enviar Invitación') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class UserModalComponent {
  user = input<UserItem | null>(null);
  isSaving = input<boolean>(false);

  close = output<void>();
  save = output<UserFormData>();
  requestReset = output<void>();

  form: UserFormData = {
    name: '',
    email: '',
    role: 'SELLER',
    isActive: true
  };

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.form = {
          name: u.name || u.profile?.fullName || '',
          email: u.email,
          role: u.role,
          isActive: u.isActive
        };
      } else {
        this.form = {
          name: '',
          email: '',
          role: 'SELLER',
          isActive: true
        };
      }
    });
  }

  isEditing(): boolean {
    return Boolean(this.user());
  }

  submitForm(): void {
    this.save.emit(this.form);
  }
}