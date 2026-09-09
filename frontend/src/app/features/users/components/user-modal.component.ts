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
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header Fijo -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm font-bold border border-emerald-100">
              👤
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">
                {{ isEditing() ? 'Editar Colaborador' : 'Nuevo Colaborador' }}
              </h3>
              <p class="text-[10px] text-slate-400 font-mono truncate max-w-[260px] sm:max-w-none">
                {{ isEditing() ? form.email : 'Se generará una invitación segura para activación' }}
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Body Scrolleable -->
        <div class="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          <!-- Datos Personales -->
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Carlos Valdivia"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none transition-all" />
            </div>
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Corporativo *</label>
              <input type="email" [(ngModel)]="form.email" placeholder="c.valdivia@vortexyolti.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none transition-all font-mono" />
            </div>
          </div>

          <!-- Selector de Roles -->
          <div>
            <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Rol Asignado en el Sistema</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" (click)="form.role = 'ADMIN'"
                [class]="form.role === 'ADMIN' ? 'border-purple-600 bg-purple-50/60 text-purple-950 ring-1 ring-purple-600 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block text-xs">Administrador</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Control Total & Altas</span>
              </button>

              <button type="button" (click)="form.role = 'MANAGER'"
                [class]="form.role === 'MANAGER' ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-1 ring-blue-600 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block text-xs">Gerente</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Supervisión & Tier 3</span>
              </button>

              <button type="button" (click)="form.role = 'SELLER'"
                [class]="form.role === 'SELLER' ? 'border-emerald-700 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-700 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block text-xs">Ventas</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Cotizador F2 & Caja</span>
              </button>

              <button type="button" (click)="form.role = 'WAREHOUSE'"
                [class]="form.role === 'WAREHOUSE' ? 'border-amber-600 bg-amber-50/60 text-amber-950 ring-1 ring-amber-600 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'"
                class="p-2.5 rounded-xl border text-left cursor-pointer transition-all">
                <span class="block text-xs">Almacén</span>
                <span class="block text-[9px] text-slate-400 mt-0.5">Kardex & Lotes</span>
              </button>
            </div>
          </div>

          <!-- Seguridad y Estado -->
          <div class="pt-2 border-t border-slate-100 space-y-3">
            @if (!isEditing()) {
              <div class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <span class="text-emerald-800 text-sm">🔒</span>
                <div>
                  <div class="font-bold text-emerald-900 text-[11px]">Flujo de Activación Segura</div>
                  <div class="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                    No necesitas ingresar credenciales. Se enviará un enlace de activación para que el colaborador configure su propia contraseña.
                  </div>
                </div>
              </div>
            } @else {
              <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div class="font-bold text-slate-900 text-[11px]">Restablecimiento de Credencial</div>
                  <div class="text-[10px] text-slate-400">Generar nuevo token de acceso</div>
                </div>
                <button type="button" (click)="requestReset.emit()"
                  class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg cursor-pointer transition-colors shadow-2xs">
                  📧 Reenviar Clave
                </button>
              </div>
            }

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs font-semibold text-slate-700">Estado de Acceso:</span>
              <button type="button" (click)="form.isActive = !form.isActive"
                [class]="form.isActive ? 'bg-emerald-800' : 'bg-slate-300'"
                class="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5">
                <span [class]="form.isActive ? 'translate-x-5' : 'translate-x-0'"
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Fijo -->
        <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
          <button type="button" (click)="close.emit()"
            class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
            Cancelar
          </button>
          <button type="button" (click)="submitForm()" [disabled]="isSaving()"
            class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
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