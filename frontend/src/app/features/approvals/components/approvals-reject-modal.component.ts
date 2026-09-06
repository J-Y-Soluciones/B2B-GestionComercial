import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-approvals-reject-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
          <div class="flex items-center gap-2">
            <span class="text-red-600 font-bold">⚠️</span>
            <h3 class="font-bold text-slate-900 text-sm">Rechazar Solicitud Tier 3</h3>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
        </div>

        <div class="p-4 space-y-3 text-xs">
          <p class="text-slate-600">
            Seleccione el motivo gerencial para rechazar la proforma <strong class="text-slate-900">{{ code() }}</strong>:
          </p>

          <div class="space-y-2">
            <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input type="radio" name="reason" value="Margen insuficiente (<15%)" [(ngModel)]="selectedReason" class="mt-0.5 text-emerald-600" />
              <div>
                <span class="font-semibold text-slate-800 block">Margen insuficiente (&lt;15%)</span>
                <span class="text-[10px] text-slate-500">El costo de reposición no admite menor margen.</span>
              </div>
            </label>

            <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input type="radio" name="reason" value="Stock prioritario para taller" [(ngModel)]="selectedReason" class="mt-0.5 text-emerald-600" />
              <div>
                <span class="font-semibold text-slate-800 block">Stock prioritario para taller</span>
                <span class="text-[10px] text-slate-500">Repuestos reservados para servicios confirmados.</span>
              </div>
            </label>
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Comentario adicional de auditoría:</label>
            <textarea 
              [(ngModel)]="customNote"
              rows="3" 
              placeholder="Detalles sobre la decisión..."
              class="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white"></textarea>
          </div>
        </div>

        <div class="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button 
            type="button"
            (click)="close.emit()"
            class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors cursor-pointer">
            Cancelar
          </button>
          <button 
            type="button"
            (click)="handleConfirm()"
            [disabled]="loading()"
            class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50">
            {{ loading() ? 'Rechazando...' : 'Confirmar Rechazo [F9]' }}
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