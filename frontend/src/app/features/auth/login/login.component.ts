// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface LoginForm {
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    remember: FormControl<boolean | null>;
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      
      <!-- Mobile Header -->
      <header class="lg:hidden flex items-center justify-between p-4 bg-emerald-950 shadow-md z-10">
        <div class="flex items-center gap-2.5">
          <div class="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <span class="text-white text-sm font-bold tracking-tight">Sistema de Repuestos</span>
        </div>
        <span class="text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-800">
          Fase 1
        </span>
      </header>

      <!-- Left Panel: Editorial -->
      <aside class="hidden lg:flex lg:w-[45%] bg-emerald-950 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-emerald-950 to-emerald-950 pointer-events-none"></div>
        
        <!-- Top Brand -->
        <div class="relative z-10 flex items-center gap-3">
          <div class="bg-emerald-500/20 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div>
            <span class="text-white text-base font-bold tracking-tight block leading-tight">Sistema de Repuestos</span>
            <span class="text-emerald-400/80 text-xs font-medium">Gestión Comercial & Inventario</span>
          </div>
        </div>

        <!-- Center Content -->
        <div class="relative z-10 my-auto py-12">
          <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Control integral de ventas, <br/>
            <span class="text-emerald-400">proformas y facturación.</span>
          </h1>
          <p class="text-emerald-100/70 text-sm lg:text-base max-w-md leading-relaxed">
            Plataforma operativa para la emisión de proformas, gestión de precios multimarca y emisión de comprobantes en tiempo real.
          </p>
        </div>

        <!-- Bottom Status -->
        <div class="relative z-10 border-t border-emerald-900/60 pt-6 flex items-center justify-between text-xs text-emerald-200/60">
          <span class="inline-flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Servidor Operativo
          </span>
          <span>Versión 1.0 - MVP</span>
        </div>
      </aside>

      <!-- Right Panel: Form -->
      <main class="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div class="w-full max-w-md">
          
          <div class="mb-8 text-center lg:text-left">
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight mb-2">Acceso Operativo</h2>
            <p class="text-slate-500 text-sm">Ingresa tus credenciales para continuar.</p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage()" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in" role="alert">
            <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm font-medium">{{ errorMessage() }}</span>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="space-y-1.5">
              <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Correo Electrónico
              </label>
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                placeholder="usuario@empresa.com"
                autocomplete="username"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200/90 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm"
                [class.border-red-300]="isFieldInvalid('email')"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Contraseña
                </label>
                <a routerLink="/forgot-password" class="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div class="relative">
                <input 
                  id="password" 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-200/90 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm"
                  [class.border-red-300]="isFieldInvalid('password')"
                />
                <button 
                  type="button" 
                  (click)="togglePassword()"
                  aria-label="Alternar visibilidad"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1"
                >
                  <svg *ngIf="!showPassword()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <svg *ngIf="showPassword()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg *ngIf="isLoading()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading() ? 'Autenticando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <!-- Footer -->
          <footer class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-400">Desarrollado por <span class="font-medium text-slate-600">VortexYolTI</span></p>
          </footer>

        </div>
      </main>
    </div>
  `,
    styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    public showPassword = signal(false);
    public isLoading = signal(false);
    public errorMessage = signal<string | null>(null);

    public loginForm = this.fb.group<LoginForm>({
        email: this.fb.control('', [Validators.required, Validators.email]),
        password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
        remember: this.fb.control(false)
    });

    public togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    public isFieldInvalid(field: keyof LoginForm): boolean {
        const control = this.loginForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    public onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { email, password } = this.loginForm.getRawValue();

        this.authService.login({ email: email!, password: password! }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.error?.message || 'Credenciales incorrectas o usuario inactivo.');
            }
        });
    }
}