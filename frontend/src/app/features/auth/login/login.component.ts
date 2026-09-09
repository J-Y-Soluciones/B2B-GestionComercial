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
    <div class="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      
      <!-- Panel Izquierdo: Branding Editorial (Desktop) -->
      <aside class="hidden lg:flex lg:w-[45%] bg-emerald-950 relative overflow-hidden flex-col justify-between p-12 lg:p-16 select-none">
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
            <span class="text-white text-base font-extrabold tracking-tight block leading-tight">VortexYolTI</span>
            <span class="text-emerald-400/80 text-xs font-mono">ERP &bull; Repuestos &bull; B2B</span>
          </div>
        </div>

        <!-- Center Content -->
        <div class="relative z-10 my-auto py-12">
          <div class="text-[10px] font-mono font-bold tracking-widest text-emerald-400/80 uppercase mb-3">
            PLATAFORMA COMERCIAL INTEGRAL
          </div>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Control central de ventas, <br/>
            <span class="text-emerald-400">proformas y facturación.</span>
          </h1>
          <p class="text-emerald-100/70 text-sm leading-relaxed max-w-md">
            Emisión ágil de cotizaciones multimarca, control de márgenes protegidos Tier 3 y sincronización inmediata con Kardex.
          </p>
        </div>

        <!-- Bottom Status -->
        <div class="relative z-10 border-t border-emerald-900/60 pt-6 flex items-center justify-between text-xs text-emerald-200/60 font-mono">
          <span class="inline-flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Entorno Operativo
          </span>
          <span>VortexYolTI Core</span>
        </div>
      </aside>

      <!-- Panel Derecho: Formulario Autenticación -->
      <main class="w-full lg:w-[55%] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-16 my-auto">
        <div class="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
          
          <!-- Encabezado Unificado -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-2 lg:hidden">
              <div class="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-100 font-bold">
                ⚙️
              </div>
              <div>
                <span class="text-xs font-extrabold text-slate-900 block leading-tight">VortexYolTI</span>
                <span class="text-[10px] text-slate-400 font-mono">Sistema de Repuestos</span>
              </div>
            </div>

            <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              ACCESO SEGURO AL SISTEMA
            </div>
            <h2 class="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">Identificación de Usuario</h2>
            <p class="text-xs text-slate-500 mt-1">Ingresa con tus credenciales asignadas para operar.</p>
          </div>

          <!-- Alerta de Error -->
          @if (errorMessage()) {
            <div class="mb-5 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in" role="alert">
              <span class="font-bold text-sm leading-none mt-0.5">⚠️</span>
              <span class="leading-snug">{{ errorMessage() }}</span>
            </div>
          }

          <!-- Formulario -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Correo Corporativo *
              </label>
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                placeholder="usuario@vortexyolti.com"
                autocomplete="username"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/20 outline-none text-xs font-mono transition-all"
                [class.border-rose-400]="isFieldInvalid('email')"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="password" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Contraseña *
                </label>
                <a routerLink="/forgot-password" class="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors">
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
                  class="w-full h-11 pl-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/20 outline-none text-xs font-mono transition-all"
                  [class.border-rose-400]="isFieldInvalid('password')"
                />
                <button 
                  type="button" 
                  (click)="togglePassword()"
                  aria-label="Alternar visibilidad"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer focus:outline-none"
                >
                  @if (!showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  }
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full h-11 flex justify-center items-center px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer pt-0.5"
            >
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando credenciales...</span>
              } @else {
                <span>Iniciar Sesión &rarr;</span>
              }
            </button>
          </form>

          <!-- Footer -->
          <footer class="mt-6 pt-4 border-t border-slate-100 text-center">
            <p class="text-[11px] text-slate-400 font-mono">VortexYolTI &bull; ERP Comercial</p>
          </footer>

        </div>
      </main>
    </div>
  `
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
        const role = this.authService.currentUser()?.role;

        if (role === 'WAREHOUSE') {
          this.router.navigate(['/catalog']);
        } else {
          this.router.navigate(['/proformas/create']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Credenciales incorrectas o usuario inactivo.');
      }
    });
  }
}