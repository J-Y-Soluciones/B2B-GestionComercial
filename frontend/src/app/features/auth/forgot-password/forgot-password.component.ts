// src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xs border border-slate-200 p-6 sm:p-8 relative overflow-hidden my-auto">
        
        <!-- Estado: Correo Enviado -->
        @if (isSuccess()) {
          <div class="text-center animate-in fade-in space-y-4">
            <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-2xl font-bold">
              ✓
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900 tracking-tight">Revisa tu bandeja de entrada</h2>
              <p class="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Hemos enviado un enlace de recuperación seguro a <strong class="text-slate-800 font-mono">{{ emailControl.value }}</strong>.
              </p>
            </div>
            <div class="pt-2">
              <a routerLink="/login" class="w-full inline-flex justify-center items-center h-11 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs">
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        } @else {
          <!-- Estado: Formulario -->
          <div class="animate-in fade-in space-y-4">
            <div>
              <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                SEGURIDAD &bull; RECUPERACIÓN
              </div>
              <h2 class="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">Recuperación de Acceso</h2>
              <p class="text-xs text-slate-500 mt-1">
                Ingresa tu correo corporativo y te enviaremos un enlace seguro para restablecer tu clave.
              </p>
            </div>

            @if (errorMessage()) {
              <div class="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                <span class="font-bold text-sm">⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="email" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Correo Corporativo *
                </label>
                <input 
                  id="email" 
                  type="email" 
                  [formControl]="emailControl"
                  placeholder="usuario@vortexyolti.com"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/20 outline-none text-xs font-mono transition-all"
                  [class.border-rose-400]="isFieldInvalid()"
                />
                @if (isFieldInvalid()) {
                  <p class="text-rose-600 text-[10px] mt-1">Ingresa un correo electrónico válido.</p>
                }
              </div>

              <button 
                type="submit" 
                [disabled]="isLoading()"
                class="w-full h-11 flex justify-center items-center px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              >
                @if (isLoading()) {
                  <span>Enviando enlace...</span>
                } @else {
                  <span>Enviar enlace de recuperación</span>
                }
              </button>
            </form>

            <div class="pt-2 text-center">
              <a routerLink="/login" class="text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors">
                &larr; Volver al inicio de sesión
              </a>
            </div>
          </div>
        }

        <!-- Footer -->
        <footer class="mt-6 pt-4 border-t border-slate-100 text-center">
          <p class="text-[11px] text-slate-400 font-mono">VortexYolTI Core</p>
        </footer>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  public isLoading = signal(false);
  public isSuccess = signal(false);
  public errorMessage = signal<string | null>(null);

  public forgotForm = this.fb.group({
    email: this.fb.control<string>('', [Validators.required, Validators.email])
  });

  get emailControl(): FormControl<string | null> {
    return this.forgotForm.get('email') as FormControl<string | null>;
  }

  public isFieldInvalid(): boolean {
    return !!(this.emailControl.invalid && (this.emailControl.dirty || this.emailControl.touched));
  }

  public onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.emailControl.value!).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al procesar la solicitud.');
      }
    });
  }
}