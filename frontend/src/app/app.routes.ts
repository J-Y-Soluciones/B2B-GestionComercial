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
                loadComponent: () => import('./features/proformas/proformas-list.component').then(m => m.ProformasListComponent),
                title: 'Cotizador y Proformas | VortexYolTI'
            },
            {
                path: 'catalog',
                loadComponent: () => import('./features/catalog/catalog-list.component').then(m => m.CatalogListComponent),
                title: 'Catálogo e Inventario | VortexYolTI'
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/customers/customers-list.component').then(m => m.CustomersListComponent),
                title: 'Clientes | VortexYolTI'
            },
            {
                path: 'approvals',
                loadComponent: () => import('./features/approvals/approvals-list.component').then(m => m.ApprovalsListComponent),
                title: 'Bandeja de Aprobaciones | VortexYolTI'
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent),
                title: 'Usuarios y Perfiles | VortexYolTI'
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