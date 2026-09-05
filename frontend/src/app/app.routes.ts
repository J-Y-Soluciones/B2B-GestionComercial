// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

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
    // Shell administrativo protegido con Guard
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'proformas',
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
                loadComponent: () => import('./features/approvals/approvals-list.component').then(m => m.ApprovalsListComponent),
                title: 'Bandeja de Aprobaciones | Sistema de Repuestos'
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent),
                title: 'Usuarios y Perfiles | Sistema de Repuestos'
            },
            {
                path: '',
                redirectTo: 'approvals',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];