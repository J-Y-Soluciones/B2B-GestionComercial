import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserItem } from '../../../core/api/users-api.service';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <!-- VISTA MÓVIL (< md): Cards táctiles -->
      <div class="block md:hidden space-y-2.5">
        @if (users().length === 0 && !isLoading()) {
          <div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No se encontraron colaboradores registrados con ese criterio.
          </div>
        }

        @for (u of users(); track u.id) {
          <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0 font-mono">
                  {{ getInitials(u.name || u.profile?.fullName || u.email) }}
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-slate-900 text-xs truncate leading-snug">{{ u.name || u.profile?.fullName || 'Colaborador' }}</h4>
                  <span class="text-[10px] text-slate-400 font-mono truncate block">{{ u.email }}</span>
                </div>
              </div>

              <span [class]="getRoleBadgeClass(u.role)"
                class="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border shrink-0">
                {{ getRoleLabel(u.role) }}
              </span>
            </div>

            <div class="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono flex items-center justify-between">
              <span>Alcance: {{ getRoleScope(u.role) }}</span>
              <span class="text-[10px] text-slate-400">{{ formatDate(u.createdAt) }}</span>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <button type="button" (click)="toggleStatus.emit(u)"
                class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                [class]="u.isActive ? 'text-emerald-700' : 'text-slate-400'">
                <span class="w-2 h-2 rounded-full" [class]="u.isActive ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                <span>{{ u.isActive ? 'Habilitado' : 'Suspendido' }}</span>
              </button>

              <button type="button" (click)="edit.emit(u)"
                class="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs">
                ✏️ Editar
              </button>
            </div>
          </div>
        }
      </div>

      <!-- VISTA ESCRITORIO (>= md): Tabla completa -->
      <div class="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
                <th class="py-3 px-4">Colaborador</th>
                <th class="py-3 px-4 text-center">Cargo / Rol</th>
                <th class="py-3 px-4 text-center">Permisos Asignados</th>
                <th class="py-3 px-4 text-center">Estado</th>
                <th class="py-3 px-4 text-center">Fecha de Alta</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (users().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                    No se encontraron colaboradores registrados con ese criterio.
                  </td>
                </tr>
              }

              @for (u of users(); track u.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0 font-mono">
                        {{ getInitials(u.name || u.profile?.fullName || u.email) }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 leading-tight">{{ u.name || u.profile?.fullName || 'Colaborador' }}</div>
                        <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <span [class]="getRoleBadgeClass(u.role)"
                      class="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border">
                      {{ getRoleLabel(u.role) }}
                    </span>
                  </td>

                  <td class="py-3 px-4 text-center text-slate-500 text-[11px]">
                    {{ getRoleScope(u.role) }}
                  </td>

                  <td class="py-3 px-4 text-center">
                    <button type="button" (click)="toggleStatus.emit(u)"
                      class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold transition-opacity hover:opacity-80"
                      [class]="u.isActive ? 'text-emerald-800' : 'text-slate-400'">
                      <span class="w-2 h-2 rounded-full" [class]="u.isActive ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                      <span>{{ u.isActive ? 'Habilitado' : 'Suspendido' }}</span>
                    </button>
                  </td>

                  <td class="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                    {{ formatDate(u.createdAt) }}
                  </td>

                  <td class="py-3 px-4 text-center">
                    <button type="button" (click)="edit.emit(u)"
                      class="text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Editar Colaborador">
                      ✏️ Editar
                    </button>
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
export class UsersTableComponent {
  users = input.required<UserItem[]>();
  isLoading = input<boolean>(false);

  edit = output<UserItem>();
  toggleStatus = output<UserItem>();

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'SELLER': return 'Ventas';
      case 'WAREHOUSE': return 'Almacén';
      default: return role;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'MANAGER': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SELLER': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'WAREHOUSE': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  }

  getRoleScope(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Control Total • Aprobación T3 • Altas';
      case 'MANAGER': return 'Supervisión • Aprobación T3';
      case 'SELLER': return 'Cotizador (F2) • Clientes RUC';
      case 'WAREHOUSE': return 'Almacén Central • Kardex Físico';
      default: return 'Acceso Básico';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}