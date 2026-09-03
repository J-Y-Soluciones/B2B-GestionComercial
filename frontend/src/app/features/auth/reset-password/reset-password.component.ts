// src/app/features/auth/reset-password/reset-password.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans overflow-y-auto">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden my-8">
        
        <!-- Top Decorative Line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>

        <!-- Success State -->
        <div *ngIf="isSuccess()" class="text-center animate-fade-in">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
            <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight mb-3">Contraseña actualizada</h2>
          <p class="text-slate-500 text-sm mb-8 leading-relaxed">
            Tu contraseña ha sido restablecida exitosamente. Ya puedes acceder al sistema con tus nuevas credenciales.
          </p>
          <a routerLink="/login" class="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all">
            Ir al inicio de sesión
          </a>
        </div>

        <!-- Form State -->
        <div *ngIf="!isSuccess()" class="animate-fade-in">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight mb-2">Crear nueva contraseña</h2>
          <p class="text-slate-500 text-sm mb-8">
            Ingresa una contraseña segura de al menos 6 caracteres para tu cuenta.
          </p>

          <!-- Error Banner -->
          <div *ngIf="errorMessage()" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
            <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span class="text-sm font-medium">{{ errorMessage() }}</span>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label for="newPassword" class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Nueva Contraseña
              </label>
              <input 
                id="newPassword" 
                type="password" 
                formControlName="newPassword"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                [class.border-red-300]="isFieldInvalid('newPassword')"
              />
              <p *ngIf="isFieldInvalid('newPassword')" class="text-red-500 text-xs mt-1">Debe tener al menos 6 caracteres.</p>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Confirmar Contraseña
              </label>
              <input 
                id="confirmPassword" 
                type="password" 
                formControlName="confirmPassword"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                [class.border-red-300]="isFieldInvalid('confirmPassword') || resetForm.errors?.['mismatch']"
              />
              <p *ngIf="resetForm.errors?.['mismatch'] && (resetForm.get('confirmPassword')?.dirty || resetForm.get('confirmPassword')?.touched)" class="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</p>
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading() || !token()"
              class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <svg *ngIf="isLoading()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading() ? 'Guardando...' : 'Guardar contraseña' }}
            </button>
          </form>
        </div>
        
        <!-- Footer Branding -->
        <div class="mt-8 text-center">
          <p class="text-xs text-slate-400">Desarrollado por VortexYolTI</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  `]
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