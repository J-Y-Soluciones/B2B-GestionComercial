import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersApiService, type UserItem } from '../../core/api/users-api.service';
import { ToastService } from '../../core/services/toast.service';
import { UserModalComponent, type UserFormData } from './components/user-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserModalComponent],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            SISTEMA &bull; SEGURIDAD &bull; CONTROL DE ACCESO
          </div>
          <div class="flex items-center gap-2.5 mt-0.5">
            <h1 class="text-base font-bold text-slate-900">Usuarios y Perfiles de Acceso</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
              Acceso Exclusivo: Administrador
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" (click)="loadUsers()"
            class="text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
            <span>🔄</span> Actualizar
          </button>
          <button type="button" (click)="openCreateModal()"
            class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>+ Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      <!-- KPIS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Colaboradores</span>
            <span class="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{{ users().length }}</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Usuarios en el sistema</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-base font-bold">
            👥
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Usuarios Activos</span>
            <span class="text-2xl font-black text-emerald-800 font-mono mt-0.5 block">{{ activeUsersCount() }}</span>
            <span class="text-[10px] text-emerald-600 font-mono mt-0.5 block">Cuentas habilitadas</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-bold">
            ✅
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Accesos Suspendidos</span>
            <span class="text-2xl font-black text-slate-500 font-mono mt-0.5 block">{{ inactiveUsersCount() }}</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Inactivos (Preservados para Auditoría)</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-base font-bold">
            🚫
          </div>
        </div>
      </div>

      <!-- BUSCADOR Y FILTROS -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-96">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nombre o correo corporativo..."
            class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select [ngModel]="selectedRole()" (ngModelChange)="selectedRole.set($event)"
            class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 cursor-pointer">
            <option value="ALL">Todos los Cargos</option>
            <option value="ADMIN">Administrador</option>
            <option value="MANAGER">Gerente</option>
            <option value="SELLER">Ventas</option>
            <option value="WAREHOUSE">Almacén</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE COLABORADORES -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <th class="py-3 px-4">Colaborador</th>
                <th class="py-3 px-4 text-center">Cargo / Rol</th>
                <th class="py-3 px-4 text-center">Permisos Asignados</th>
                <th class="py-3 px-4 text-center">Estado</th>
                <th class="py-3 px-4 text-center">Fecha de Alta</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (filteredUsers().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="6" class="py-10 text-center text-slate-400 text-xs">
                    No se encontraron colaboradores registrados con ese criterio.
                  </td>
                </tr>
              }

              @for (u of filteredUsers(); track u.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                        {{ getInitials(u.name || u.profile?.fullName || u.email) }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">{{ u.name || u.profile?.fullName || 'Colaborador' }}</div>
                        <div class="text-[11px] text-slate-400 font-mono">{{ u.email }}</div>
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
                    <button type="button" (click)="toggleUserStatus(u)"
                      class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                      [class]="u.isActive ? 'text-emerald-700' : 'text-slate-400'">
                      <span class="w-2 h-2 rounded-full" [class]="u.isActive ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                      {{ u.isActive ? 'Habilitado' : 'Suspendido' }}
                    </button>
                  </td>

                  <td class="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                    {{ formatDate(u.createdAt) }}
                  </td>

                  <td class="py-3 px-4 text-center">
                    <button type="button" (click)="openEditModal(u)"
                      class="text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors"
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

      <!-- MODAL DUMB COMPONENT -->
      @if (isModalOpen()) {
        <app-user-modal
          [user]="selectedUser()"
          [isSaving]="isSaving()"
          (close)="closeModal()"
          (save)="handleUserSave($event)"
          (requestReset)="handleRequestReset()" />
      }
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastService);

  users = signal<UserItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  searchQuery = signal('');
  selectedRole = signal('ALL');

  isModalOpen = signal(false);
  selectedUser = signal<UserItem | null>(null);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

    return this.users().filter((u) => {
      const matchRole = role === 'ALL' || u.role === role;
      const matchQuery = !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.profile?.fullName && u.profile.fullName.toLowerCase().includes(q));

      return matchRole && matchQuery;
    });
  });

  activeUsersCount = computed(() => this.users().filter((u) => u.isActive).length);
  inactiveUsersCount = computed(() => this.users().filter((u) => !u.isActive).length);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usersApi.getAll().subscribe({
      next: (res: any) => {
        this.users.set(Array.isArray(res) ? res : (res.data || []));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  toggleUserStatus(user: UserItem): void {
    this.usersApi.toggleStatus(user.id).subscribe({
      next: (updated) => {
        this.toast.show(`Estado de "${user.email}" actualizado a ${updated.isActive ? 'Habilitado' : 'Suspendido'}.`, 'info');
        this.loadUsers();
      },
      error: (err) => this.toast.show(err?.error?.message || 'Error al cambiar estado.', 'error')
    });
  }

  openCreateModal(): void {
    this.selectedUser.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(user: UserItem): void {
    this.selectedUser.set(user);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  handleRequestReset(): void {
    const current = this.selectedUser();
    if (!current) return;

    this.usersApi.sendResetPassword(current.id).subscribe({
      next: () => {
        this.toast.show(`Enlace generado para ${current.email}. Revisa la terminal del servidor.`, 'success');
      },
      error: (err) => this.toast.show(err?.error?.message || 'Error al solicitar enlace.', 'error')
    });
  }

  handleUserSave(form: UserFormData): void {
    if (!form.email?.trim()) {
      this.toast.show('El correo corporativo es obligatorio.', 'error');
      return;
    }

    const current = this.selectedUser();
    this.isSaving.set(true);

    if (current) {
      this.usersApi.update(current.id, {
        email: form.email,
        name: form.name,
        role: form.role,
        isActive: form.isActive
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.show(`Colaborador actualizado exitosamente.`, 'success');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.show(err?.error?.message || 'Error al actualizar usuario.', 'error');
        }
      });
    } else {
      this.usersApi.create({
        email: form.email,
        name: form.name,
        role: form.role
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.show(`Invitación enviada a ${form.email}. Revisa la terminal del servidor.`, 'success');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toast.show(err?.error?.message || 'Error al registrar colaborador.', 'error');
        }
      });
    }
  }
}