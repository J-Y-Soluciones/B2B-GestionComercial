// src/app/features/auth/reset-password/reset-password.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xs border border-slate-200 p-6 sm:p-8 relative overflow-hidden my-auto">
        
        <!-- Éxito -->
        @if (isSuccess()) {
          <div class="text-center animate-in fade-in space-y-4">
            <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-2xl font-bold">
              ✓
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900 tracking-tight">Contraseña actualizada</h2>
              <p class="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Tu clave ha sido restablecida exitosamente. Ya puedes acceder con tus nuevas credenciales.
              </p>
            </div>
            <div class="pt-2">
              <a routerLink="/login" class="w-full inline-flex justify-center items-center h-11 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-xs">
                Ir al inicio de sesión &rarr;
              </a>
            </div>
          </div>
        } @else {
          <!-- Formulario -->
          <div class="animate-in fade-in space-y-4">
            <div>
              <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                SEGURIDAD &bull; NUEVA CLAVE
              </div>
              <h2 class="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">Crear nueva contraseña</h2>
              <p class="text-xs text-slate-500 mt-1">
                Ingresa una contraseña segura de al menos 6 caracteres para tu cuenta.
              </p>
            </div>

            @if (errorMessage()) {
              <div class="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                <span class="font-bold text-sm">⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="newPassword" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nueva Contraseña *
                </label>
                <input 
                  id="newPassword" 
                  type="password" 
                  formControlName="newPassword"
                  placeholder="••••••••"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/20 outline-none text-xs font-mono transition-all"
                  [class.border-rose-400]="isFieldInvalid('newPassword')"
                />
                @if (isFieldInvalid('newPassword')) {
                  <p class="text-rose-600 text-[10px] mt-1">Debe tener al menos 6 caracteres.</p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirmar Contraseña *
                </label>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/20 outline-none text-xs font-mono transition-all"
                  [class.border-rose-400]="isFieldInvalid('confirmPassword') || resetForm.errors?.['mismatch']"
                />
                @if (resetForm.errors?.['mismatch'] && (resetForm.get('confirmPassword')?.dirty || resetForm.get('confirmPassword')?.touched)) {
                  <p class="text-rose-600 text-[10px] mt-1">Las contraseñas no coinciden.</p>
                }
              </div>

              <button 
                type="submit" 
                [disabled]="isLoading() || !token()"
                class="w-full h-11 flex justify-center items-center px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              >
                @if (isLoading()) {
                  <span>Actualizando contraseña...</span>
                } @else {
                  <span>Guardar nueva contraseña</span>
                }
              </button>
            </form>
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
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  public isLoading = signal(false);
  public isSuccess = signal(false);
  public errorMessage = signal<string | null>(null);
  public token = signal<string | null>(null);

  public resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tokenParam = params['token'];
      if (tokenParam) {
        this.token.set(tokenParam);
      } else {
        this.errorMessage.set('El enlace de recuperación es inválido o está incompleto.');
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  public isFieldInvalid(field: string): boolean {
    const control = this.resetForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public onSubmit(): void {
    if (this.resetForm.invalid || !this.token()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      token: this.token()!,
      newPassword: this.resetForm.getRawValue().newPassword!
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'El token ha expirado o es inválido. Solicita uno nuevo.');
      }
    });
  }
}