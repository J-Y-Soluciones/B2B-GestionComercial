import { Component, signal, computed, inject, OnInit, HostListener, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ProformasService } from '../../core/services/proformas.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-100/70 flex flex-col md:flex-row text-slate-800 font-sans antialiased">
      <!-- SIDEBAR BLANCO CORPORATIVO -->
      <aside 
        class="bg-white text-slate-700 flex-shrink-0 transition-all duration-300 flex flex-col justify-between border-r border-slate-200 z-20 select-none"
        [ngClass]="sidebarExpanded() ? 'w-64' : 'w-20'">
        
        <div>
          <!-- Header de Marca -->
          <div class="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            @if (sidebarExpanded()) {
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-900/10">
                  <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-extrabold tracking-tight text-slate-900 leading-none">VortexYolTI</span>
                  <span class="text-[9px] text-slate-400 font-semibold tracking-wider mt-1 uppercase">Repuestos ERP</span>
                </div>
              </div>
            } @else {
              <div class="w-8 h-8 mx-auto rounded-lg bg-[#064e3b] flex items-center justify-center text-white shadow-sm">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
            }
            <button 
              (click)="toggleSidebar()" 
              class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden md:block"
              title="Colapsar menú">
              <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!sidebarExpanded()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
          </div>

          <!-- Módulo Context Badge -->
          @if (sidebarExpanded()) {
            <div class="px-4 pt-3.5 pb-2">
              <div class="bg-emerald-50/60 border border-emerald-100/90 rounded-lg px-3 py-2 text-[10px] font-bold text-emerald-900 tracking-wider flex items-center gap-2 uppercase">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Módulo Comercial</span>
              </div>
            </div>
          }

          <!-- Navegación Dinámica -->
          <nav class="p-3 space-y-1">
            <!-- Aprobaciones Tier 3 (Exclusivo para ADMIN y MANAGER) -->
            @if (canViewApprovals()) {
              <a 
                routerLink="/approvals" 
                routerLinkActive="!bg-[#064e3b] !text-white shadow-sm active-item"
                class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 transition-all text-xs font-medium group">
                <div class="flex items-center gap-3 min-w-0">
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  @if (sidebarExpanded()) {
                    <span class="truncate">Aprobaciones (T3)</span>
                  }
                </div>
                @if (sidebarExpanded() && pendingApprovalsCount() > 0) {
                  <span class="text-[10px] font-bold bg-[#d97706] text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                    {{ pendingApprovalsCount() }} pendientes
                  </span>
                }
              </a>
            }

            <!-- Módulos autorizados de la sesión -->
            @for (mod of modules(); track mod.moduleCode) {
              @if (mod.path !== '/approvals') {
                <a 
                  [routerLink]="mod.moduleCode === 'PROFORMAS' ? '/proformas/create' : mod.path" 
                  routerLinkActive="!bg-[#064e3b] !text-white shadow-sm active-item"
                  class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                  <div class="flex items-center gap-3 min-w-0">
                    <ng-container [ngSwitch]="mod.moduleCode">
                      <svg *ngSwitchCase="'PROFORMAS'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <svg *ngSwitchCase="'CATALOG'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                      <svg *ngSwitchCase="'CUSTOMERS'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <svg *ngSwitchCase="'USERS'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <svg *ngSwitchDefault class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                      </svg>
                    </ng-container>

                    @if (sidebarExpanded()) {
                      <span class="truncate">{{ mod.name }}</span>
                    }
                  </div>
                  @if (sidebarExpanded() && mod.moduleCode === 'PROFORMAS') {
                    <span class="text-[9px] font-semibold text-slate-400 bg-slate-100 group-[.active-item]:bg-emerald-900 group-[.active-item]:text-emerald-200 px-1 py-0.5 rounded border border-slate-200 group-[.active-item]:border-emerald-800">F2</span>
                  }
                </a>
              }
            }

            <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 text-xs cursor-default">
              <svg class="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              @if (sidebarExpanded()) {
                <span class="truncate">Proveedores & OC</span>
              }
            </div>

            <div class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 text-xs cursor-not-allowed">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                @if (sidebarExpanded()) {
                  <span class="truncate">Reportes & Auditoría</span>
                }
              </div>
              @if (sidebarExpanded()) {
                <span class="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.2 rounded border border-slate-200">Pronto</span>
              }
            </div>
          </nav>
        </div>

        <!-- Footer Sidebar -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50">
          @if (sidebarExpanded()) {
            <div class="flex items-center gap-2 text-[11px]">
              <div class="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 text-[11px] truncate">Almacén Principal</span>
                  <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> 42ms
                  </span>
                </div>
                <span class="text-[10px] text-slate-400 truncate block">Sucursal Central - Av. Grau 1420</span>
              </div>
            </div>
          } @else {
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto" title="Sucursal Central Conectada"></div>
          }
        </div>
      </aside>

      <!-- ÁREA PRINCIPAL -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- HEADER SUPERIOR -->
        <header class="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2.5 text-xs">
            <span class="text-slate-400 font-medium">VortexYolTI</span>
            <span class="text-slate-300">/</span>
            <span class="text-slate-400 font-medium">Comercial</span>
            <span class="text-slate-300">/</span>
            <span class="font-bold text-emerald-950">
              {{ currentRouteTitle() }}
            </span>

            <div class="hidden xl:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 text-slate-600">
              <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <select class="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium outline-none text-slate-700">
                <option>Sucursal Principal - Lima Centro</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden lg:flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-[11px]">
              <span class="text-slate-400">TC:</span>
              <span class="font-semibold text-slate-700 font-mono">Venta S/ 3.742</span>
              <span class="text-slate-300">|</span>
              <span class="text-slate-500 font-mono">Compra S/ 3.738</span>
            </div>

            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {{ currentUser()?.profile?.name || currentUser()?.role || 'GERENTE COMERCIAL' }}
            </span>

            <button 
              (click)="logout()"
              class="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
              title="Cerrar sesión">
              Salir
            </button>
          </div>
        </header>

        <!-- CONTENIDO -->
        <main class="flex-1 p-5 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly proformasService = inject(ProformasService);
  private readonly destroyRef = inject(DestroyRef);

  public sidebarExpanded = signal(true);
  public pendingApprovalsCount = this.proformasService.pendingApprovalsCount;
  public currentUser = this.authService.currentUser;
  public modules = this.authService.authorizedModules;

  // Evalúa permisos para mostrar aprobaciones solo a ADMIN o MANAGER
  public canViewApprovals = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.router.navigate(['/proformas/create']);
    }
  }

  currentRouteTitle(): string {
    const url = this.router.url;
    if (url.includes('/proformas/create')) return 'Cotizador & Emisión de Proformas (F2)';
    if (url.includes('/proformas')) return 'Listado de Proformas';
    if (url.includes('/catalog')) return 'Catálogo e Inventario';
    if (url.includes('/customers')) return 'Clientes & Cuentas RUC';
    if (url.includes('/approvals')) return 'Bandeja de Aprobaciones (Tier 3)';
    if (url.includes('/users')) return 'Usuarios y Perfiles';
    return 'Panel de Control';
  }

  ngOnInit(): void {
    // Solo carga el contador si el usuario tiene rol habilitado para aprobar
    if (this.canViewApprovals()) {
      this.proformasService.refreshPendingCount();

      this.router.events
        .pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.proformasService.refreshPendingCount();
        });
    }
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}