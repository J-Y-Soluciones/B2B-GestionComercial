import { Component, signal, computed, inject, OnInit, HostListener, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ProformasService } from '../../core/services/proformas.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-100/70 flex text-slate-800 font-sans antialiased relative">
      
      <!-- BACKDROP MÓVIL (Solo cuando el menú está abierto en pantallas pequeñas) -->
      @if (mobileMenuOpen()) {
        <div 
          (click)="mobileMenuOpen.set(false)"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-40 md:hidden transition-opacity">
        </div>
      }

      <!-- SIDEBAR (Drawer flotante en móvil, Estático en Desktop) -->
      <aside 
        class="bg-white text-slate-700 flex flex-col justify-between border-r border-slate-200 z-50 select-none transition-all duration-300
               fixed inset-y-0 left-0 md:static md:translate-x-0 shrink-0"
        [ngClass]="[
          mobileMenuOpen() ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          sidebarExpanded() ? 'w-64' : 'w-64 md:w-20'
        ]">
        
        <div class="overflow-y-auto flex-1">
          <!-- Header de Marca -->
          <div class="h-14 md:h-16 flex items-center justify-between px-4 border-b border-slate-100">
            @if (sidebarExpanded() || mobileMenuOpen()) {
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center text-white shadow-xs">
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
              <div class="w-8 h-8 mx-auto rounded-lg bg-[#064e3b] flex items-center justify-center text-white shadow-xs">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
            }

            <!-- Botón Colapsar (Desktop) -->
            <button 
              (click)="toggleSidebar()" 
              class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden md:block cursor-pointer"
              title="Colapsar menú">
              <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!sidebarExpanded()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <!-- Botón Cerrar Drawer (Móvil) -->
            <button 
              (click)="mobileMenuOpen.set(false)" 
              class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 md:hidden cursor-pointer">
              ✕
            </button>
          </div>

          <!-- NAVEGACIÓN -->
          <nav class="p-3 space-y-4">
            <!-- SECCIÓN 1: OPERACIONES & CAJA -->
            @if (hasProformasAccess() || canAccessSales()) {
              <div>
                @if (sidebarExpanded() || mobileMenuOpen()) {
                  <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Ventas & Mostrador
                  </span>
                }
                <div class="space-y-1">
                  @if (hasProformasAccess()) {
                    <a 
                      routerLink="/proformas/create" 
                      (click)="onNavigate()"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Cotizador Rápido</span>
                        }
                      </div>
                      @if (sidebarExpanded() || mobileMenuOpen()) {
                        <span class="text-[9px] font-semibold text-slate-400 bg-slate-100 group-[.active-item]:bg-emerald-900 group-[.active-item]:text-emerald-200 px-1 py-0.5 rounded border border-slate-200">F2</span>
                      }
                    </a>
                  }

                  @if (canAccessSales()) {
                    <a 
                      routerLink="/sales/checkout" 
                      (click)="onNavigate()"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Caja & Checkout</span>
                        }
                      </div>
                      @if (sidebarExpanded() || mobileMenuOpen()) {
                        <span class="text-[9px] font-semibold text-slate-400 bg-slate-100 group-[.active-item]:bg-emerald-900 group-[.active-item]:text-emerald-200 px-1 py-0.5 rounded border border-slate-200">F8</span>
                      }
                    </a>
                  }

                  @if (hasProformasAccess()) {
                    <a 
                      routerLink="/proformas" 
                      (click)="onNavigate()"
                      [routerLinkActiveOptions]="{ exact: true }"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Historial Proformas</span>
                        }
                      </div>
                    </a>
                  }

                  @if (canAccessSales()) {
                    <a 
                      routerLink="/sales" 
                      (click)="onNavigate()"
                      [routerLinkActiveOptions]="{ exact: true }"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                          <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Historial de Ventas</span>
                        }
                      </div>
                    </a>
                  }
                </div>
              </div>
            }

            <!-- SECCIÓN 2: ALMACÉN & CATÁLOGOS -->
            <div class="pt-2 border-t border-slate-100">
              @if (sidebarExpanded() || mobileMenuOpen()) {
                <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Almacén & Maestros
                </span>
              }
              <div class="space-y-1">
                @for (mod of otherModules(); track mod.moduleCode) {
                  <a 
                    [routerLink]="mod.path" 
                    (click)="onNavigate()"
                    routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                    class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                    <div class="flex items-center gap-3 min-w-0">
                      <ng-container [ngSwitch]="mod.moduleCode">
                        <svg *ngSwitchCase="'CATALOG'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <svg *ngSwitchCase="'CUSTOMERS'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <svg *ngSwitchCase="'USERS'" class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <svg *ngSwitchDefault class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                      </ng-container>

                      @if (sidebarExpanded() || mobileMenuOpen()) {
                        <span class="truncate">{{ mod.name }}</span>
                      }
                    </div>
                  </a>
                }

                <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 text-xs cursor-default">
                  <svg class="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                  @if (sidebarExpanded() || mobileMenuOpen()) {
                    <span class="truncate">Proveedores & OC</span>
                  }
                </div>
              </div>
            </div>

            <!-- SECCIÓN 3: CONTROL & SUPERVISIÓN -->
            @if (canViewApprovals() || canAccessPromotions()) {
              <div class="pt-2 border-t border-slate-100">
                @if (sidebarExpanded() || mobileMenuOpen()) {
                  <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Supervisión B2B
                  </span>
                }
                <div class="space-y-1">
                  @if (canViewApprovals()) {
                    <a 
                      routerLink="/approvals" 
                      (click)="onNavigate()"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Aprobaciones (T3)</span>
                        }
                      </div>
                      @if ((sidebarExpanded() || mobileMenuOpen()) && pendingApprovalsCount() > 0) {
                        <span class="text-[10px] font-bold bg-[#d97706] text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                          {{ pendingApprovalsCount() }}
                        </span>
                      }
                    </a>
                  }

                  @if (canAccessPromotions()) {
                    <a 
                      routerLink="/promotions" 
                      (click)="onNavigate()"
                      routerLinkActive="!bg-[#064e3b] !text-white shadow-xs active-item"
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all text-xs font-medium group">
                      <div class="flex items-center gap-3 min-w-0">
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-[.active-item]:text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <line x1="19" y1="5" x2="5" y2="19"></line>
                          <circle cx="6.5" cy="6.5" r="2.5"></circle>
                          <circle cx="17.5" cy="17.5" r="2.5"></circle>
                        </svg>
                        @if (sidebarExpanded() || mobileMenuOpen()) {
                          <span class="truncate">Promociones</span>
                        }
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          </nav>
        </div>

        <!-- Footer Sidebar -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50">
          @if (sidebarExpanded() || mobileMenuOpen()) {
            <div class="flex items-center gap-2 text-[11px]">
              <div class="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
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
                <span class="text-[10px] text-slate-400 truncate block">Sucursal Central</span>
              </div>
            </div>
          } @else {
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto" title="Sucursal Central Conectada"></div>
          }
        </div>
      </aside>

      <!-- ÁREA PRINCIPAL -->
      <div class="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        
        <!-- HEADER SUPERIOR -->
        <header class="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shadow-2xs shrink-0 z-10">
          
          <!-- Lado Izquierdo: Hamburguesa (Mobile) + Breadcrumb -->
          <div class="flex items-center gap-2 sm:gap-2.5 text-xs min-w-0">
            <button 
              (click)="mobileMenuOpen.set(true)" 
              type="button"
              class="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none"
              title="Abrir menú">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <span class="hidden sm:inline text-slate-400 font-medium">VortexYolTI</span>
            <span class="hidden sm:inline text-slate-300">/</span>
            <span class="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
              {{ currentRouteTitle() }}
            </span>
          </div>

          <!-- Lado Derecho: TC + Rol + Salir -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <div class="hidden xl:flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-[11px]">
              <span class="text-slate-400">TC:</span>
              <span class="font-semibold text-slate-700 font-mono">Venta S/ 3.742</span>
            </div>

            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 truncate max-w-[110px] sm:max-w-none">
              {{ currentUser()?.profile?.name || currentUser()?.role || 'GERENTE' }}
            </span>

            <button 
              (click)="logout()"
              class="px-2 sm:px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión">
              Salir
            </button>
          </div>
        </header>

        <!-- CONTENIDO VINCULADO AL ROUTER -->
        <main class="flex-1 p-3 sm:p-5 overflow-y-auto w-full min-w-0">
          <router-outlet />
        </main>
      </div>

      <!-- TOAST CONTAINER -->
      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[90vw]">
        @for (toast of toastService.toasts(); track toast.id) {
          <div 
            class="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg shadow-lg border text-xs font-medium transition-all"
            [ngClass]="{
              'bg-slate-900 text-white border-slate-800': toast.type === 'info',
              'bg-emerald-900 text-emerald-100 border-emerald-700': toast.type === 'success',
              'bg-rose-900 text-rose-100 border-rose-700': toast.type === 'error'
            }">
            <span>{{ toast.text }}</span>
            <button (click)="toastService.remove(toast.id)" class="ml-2 text-slate-400 hover:text-white cursor-pointer">&times;</button>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly proformasService = inject(ProformasService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly toastService = inject(ToastService);

  public sidebarExpanded = signal(true);
  public mobileMenuOpen = signal(false);

  public pendingApprovalsCount = this.proformasService.pendingApprovalsCount;
  public currentUser = this.authService.currentUser;
  public modules = this.authService.authorizedModules;

  public canViewApprovals = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  });

  public canAccessSales = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'SELLER';
  });

  public canAccessPromotions = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  });

  public hasProformasAccess = computed(() => {
    return this.modules().some((m) => m.moduleCode === 'PROFORMAS');
  });

  public otherModules = computed(() => {
    return this.modules().filter(
      (m) =>
        m.moduleCode !== 'PROFORMAS' &&
        m.moduleCode !== 'SALES' &&
        m.path !== '/approvals' &&
        m.path !== '/sales' &&
        m.path !== '/promotions'
    );
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.router.navigate(['/proformas/create']);
    } else if (event.key === 'F8') {
      if (this.canAccessSales()) {
        event.preventDefault();
        this.router.navigate(['/sales/checkout']);
      }
    }
  }

  currentRouteTitle(): string {
    const url = this.router.url;
    if (url.includes('/sales/checkout')) return 'Checkout (F8)';
    if (url.includes('/sales')) return 'Historial Ventas';
    if (url.includes('/promotions')) return 'Promociones';
    if (url.includes('/proformas/create')) return 'Cotizador (F2)';
    if (url.includes('/proformas')) return 'Proformas';
    if (url.includes('/catalog')) return 'Catálogo e Inventario';
    if (url.includes('/customers')) return 'Clientes';
    if (url.includes('/approvals')) return 'Aprobaciones (T3)';
    if (url.includes('/users')) return 'Usuarios';
    return 'Panel';
  }

  ngOnInit(): void {
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

  onNavigate(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}