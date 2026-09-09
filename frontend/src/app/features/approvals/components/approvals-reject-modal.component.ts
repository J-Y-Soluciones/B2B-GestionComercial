import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approvals-reject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header Fijo -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50 shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-rose-700 font-bold text-sm">⚠️</span>
            <h3 class="font-bold text-slate-900 text-sm">Rechazo de Margen Tier 3</h3>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Body con Scroll Suave -->
        <div class="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          <p class="text-slate-600">
            Indica el motivo gerencial para rechazar la proforma <strong class="text-slate-900 font-mono">{{ code() }}</strong>:
          </p>

          <div class="space-y-2">
            <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="reason" value="Margen insuficiente (<15%)" [(ngModel)]="selectedReason" class="mt-0.5 text-emerald-800" />
              <div>
                <span class="font-bold text-slate-800 block">Margen insuficiente (&lt;15%)</span>
                <span class="text-[10px] text-slate-500">El costo de reposición no admite menor margen.</span>
              </div>
            </label>

            <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="radio" name="reason" value="Stock prioritario para taller" [(ngModel)]="selectedReason" class="mt-0.5 text-emerald-800" />
              <div>
                <span class="font-bold text-slate-800 block">Stock prioritario reservado</span>
                <span class="text-[10px] text-slate-500">Repuestos comprometidos para órdenes confirmadas.</span>
              </div>
            </label>
          </div>

          <div>
            <label class="font-mono font-bold text-[10px] uppercase text-slate-500 block mb-1">Nota adicional para auditoría:</label>
            <textarea 
              [(ngModel)]="customNote"
              rows="3" 
              placeholder="Escribe el sustento de la decisión..."
              class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"></textarea>
          </div>
        </div>

        <!-- Footer Fijo -->
        <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 text-xs shrink-0">
          <button 
            type="button"
            (click)="close.emit()"
            class="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors cursor-pointer">
            Cancelar
          </button>
          <button 
            type="button"
            (click)="handleConfirm()"
            [disabled]="loading()"
            class="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
            <span>{{ loading() ? 'Rechazando...' : 'Confirmar Rechazo' }}</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-rose-900 text-rose-200 px-1 rounded">F9</kbd>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ApprovalsRejectModalComponent {
  code = input.required<string>();
  loading = input<boolean>(false);

  close = output<void>();
  confirm = output<string>();

  selectedReason = 'Margen insuficiente (<15%)';
  customNote = '';

  handleConfirm(): void {
    const reason = this.customNote.trim()
      ? `${this.selectedReason}: ${this.customNote.trim()}`
      : this.selectedReason;
    this.confirm.emit(reason);
  }
}