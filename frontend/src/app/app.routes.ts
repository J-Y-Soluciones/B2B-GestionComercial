import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Iniciar Sesión | Sistema de Repuestos'
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Recuperar Contraseña | Sistema de Repuestos'
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Restablecer Contraseña | Sistema de Repuestos'
    },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'proformas',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'MANAGER', 'SELLER'] },
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/proformas/proformas-list.component').then(m => m.ProformasListComponent),
                        title: 'Listado de Proformas | Sistema de Repuestos'
                    },
                    {
                        path: 'create',
                        loadComponent: () => import('./features/proformas/components/cotizador/cotizador.component').then(m => m.CotizadorComponent),
                        title: 'Cotizador Rápido F2 | Sistema de Repuestos'
                    }
                ]
            },
            {
                path: 'sales',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/sales/sales-list.component').then(m => m.SalesListComponent),
                        title: 'Historial de Ventas & Auditoría | Sistema de Repuestos'
                    },
                    {
                        path: 'checkout',
                        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
                        title: 'Checkout & Emisión Mostrador | Sistema de Repuestos'
                    },
                    {
                        path: 'checkout/:proformaId',
                        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
                        title: 'Checkout Proforma | Sistema de Repuestos'
                    }
                ]
            },
            {
                path: 'promotions',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'MANAGER'] },
                loadComponent: () => import('./features/promotions/promotions-list.component').then(m => m.PromotionsListComponent),
                title: 'Promociones & Descuentos Especiales | Sistema de Repuestos'
            },
            {
                path: 'catalog',
                loadComponent: () => import('./features/catalog/catalog-list.component').then(m => m.CatalogListComponent),
                title: 'Catálogo e Inventario | Sistema de Repuestos'
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/customers/customers-list.component').then(m => m.CustomersListComponent),
                title: 'Clientes | Sistema de Repuestos'
            },
            {
                path: 'approvals',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'MANAGER'] },
                loadComponent: () => import('./features/approvals/approvals-list.component').then(m => m.ApprovalsListComponent),
                title: 'Bandeja de Aprobaciones | Sistema de Repuestos'
            },
            {
                path: 'users',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent),
                title: 'Usuarios y Perfiles | Sistema de Repuestos'
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: () => {
                    const auth = inject(AuthService);
                    const role = auth.currentUser()?.role;

                    if (role === 'WAREHOUSE') {
                        return 'catalog';
                    }

                    return 'proformas/create';
                }
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];