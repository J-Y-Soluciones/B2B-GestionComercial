import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApiService, type UserItem } from '../../core/api/users-api.service';
import { ToastService } from '../../core/services/toast.service';
import { UsersKpisComponent } from './components/users-kpis.component';
import { UsersFiltersComponent } from './components/users-filters.component';
import { UsersTableComponent } from './components/users-table.component';
import { UserModalComponent, type UserFormData } from './components/user-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    UsersKpisComponent,
    UsersFiltersComponent,
    UsersTableComponent,
    UserModalComponent
  ],
  template: `
    <div class="space-y-4 sm:space-y-5 font-sans">
      <!-- HEADER ESTANDARIZADO -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            SISTEMA &bull; SEGURIDAD &bull; CONTROL DE ACCESO
          </div>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
              Usuarios y Perfiles de Acceso
            </h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Acceso Exclusivo: Administrador
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Administración de colaboradores, asignación de roles y control de privilegios en caja y cotizador.
          </p>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" (click)="loadUsers()"
            class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            title="Recargar colaboradores">
            <span>🔄</span>
            <span class="hidden sm:inline">Actualizar</span>
          </button>
          <button type="button" (click)="openCreateModal()"
            class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
            <span>+</span>
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      <!-- KPIS -->
      <app-users-kpis 
        [totalCount]="users().length" 
        [activeCount]="activeUsersCount()" 
        [inactiveCount]="inactiveUsersCount()" />

      <!-- FILTROS -->
      <app-users-filters 
        [searchQuery]="searchQuery()" 
        [selectedRole]="selectedRole()" 
        (searchChange)="searchQuery.set($event)" 
        (roleChange)="selectedRole.set($event)" />

      <!-- TABLA / CARDS RESPONSIVE -->
      <app-users-table 
        [users]="filteredUsers()" 
        [isLoading]="isLoading()" 
        (edit)="openEditModal($event)" 
        (toggleStatus)="toggleUserStatus($event)" />

      <!-- MODAL FORM -->
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

    const request$ = current
      ? this.usersApi.update(current.id, {
        email: form.email,
        name: form.name,
        role: form.role,
        isActive: form.isActive
      })
      : this.usersApi.create({
        email: form.email,
        name: form.name,
        role: form.role
      });

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.show(current ? 'Colaborador actualizado exitosamente.' : `Invitación enviada a ${form.email}.`, 'success');
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.show(err?.error?.message || 'Error al procesar colaborador.', 'error');
      }
    });
  }
}