// frontend/src/app/features/approvals/approvals-list.component.ts
import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProformasService } from '../../core/services/proformas.service';
import { ToastService } from '../../core/services/toast.service';

export interface ProformaDetailDto {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  priceTier: number;
  subtotal: number | string;
  product: {
    internalCode: string;
    name: string;
    brand: string;
    category: string;
  };
}

export interface ProformaApiDto {
  id: string;
  code: string;
  status: string;
  totalAmount: number | string;
  expiresAt: string;
  createdAt: string;
  seller?: {
    email: string;
  };
  customer: {
    id: string;
    name: string;
    documentNumber: string;
    phone?: string;
    address?: string;
    type: string;
  };
  details: ProformaDetailDto[];
  statusLogs?: {
    reason?: string;
    changedBy?: { email: string };
  }[];
}

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- HEADER OPERATIVO -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Bandeja de Aprobaciones de Precio (Tier 3)</h1>
            <span class="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              {{ pendingCount() }} Pendientes
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Supervisión y control de cotizaciones excepcionales con precio mayorista Tier 3</p>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <button (click)="loadData()" class="text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>🔄</span> Actualizar
          </button>
        </div>
      </div>

      <!-- KPIS OPERATIVOS CON DATA REAL -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Monto en Revisión (T3)</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-xl font-bold text-slate-900 font-mono">S/ {{ totalPendingAmount().toFixed(2) }}</span>
            </div>
            <span class="text-[10px] text-slate-400 mt-0.5 block">{{ pendingCount() }} proformas por evaluar</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">
            💵
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pendientes Urgentes</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-xl font-bold text-slate-900 font-mono">{{ pendingCount() }} Proformas</span>
            </div>
            <span class="text-[10px] text-amber-600 mt-0.5 block">Requieren validación de margen</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-lg">
            ⏱️
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-xl border-2 border-amber-300 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Total Proformas Cargadas</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-xl font-bold text-amber-900 font-mono">{{ proformas().length }} Registros</span>
            </div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Sincronizado con PostgreSQL</span>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-lg">
            ⚡
          </div>
        </div>
      </div>

      <!-- MASTER-DETAIL (SPLIT VIEW) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        <!-- TABLA PRINCIPAL (IZQUIERDA) -->
        <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div class="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700">Solicitudes en Espera</span>
            @if (loading()) {
              <span class="text-xs text-emerald-600 animate-pulse font-medium">Cargando datos...</span>
            }
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <th class="py-2.5 px-3">Código</th>
                  <th class="py-2.5 px-3">Cliente</th>
                  <th class="py-2.5 px-3">Vendedor</th>
                  <th class="py-2.5 px-3 text-right">Monto Total</th>
                  <th class="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (p of proformas(); track p.id) {
                  <tr 
                    (click)="selectProforma(p)"
                    [ngClass]="selected()?.id === p.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50'"
                    class="cursor-pointer transition-colors">
                    
                    <td 
                      class="py-2.5 px-3 transition-all"
                      [ngClass]="selected()?.id === p.id ? 'border-l-4 border-l-[#064e3b]' : 'border-l-4 border-l-transparent'">
                      <div class="font-bold text-slate-900">{{ p.code }}</div>
                      <div class="text-[10px] text-slate-400">{{ p.createdAt | date:'short' }}</div>
                    </td>

                    <td class="py-2.5 px-3">
                      <div class="font-medium text-slate-800 truncate max-w-[160px]">{{ p.customer.name }}</div>
                      <div class="text-[10px] text-slate-400">Doc: {{ p.customer.documentNumber }}</div>
                    </td>

                    <td class="py-2.5 px-3 text-slate-600">
                      <div class="truncate max-w-[120px]">{{ p.seller?.email || 'Ventas' }}</div>
                    </td>

                    <td class="py-2.5 px-3 text-right">
                      <div class="font-bold font-mono text-slate-900">S/ {{ toNumber(p.totalAmount).toFixed(2) }}</div>
                      <span class="text-[9px] text-slate-400">Inc. IGV</span>
                    </td>

                    <td class="py-2.5 px-3 text-center">
                      <button 
                        class="text-[10px] font-semibold px-2 py-1 rounded border transition-colors cursor-pointer"
                        [ngClass]="selected()?.id === p.id ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'">
                        {{ selected()?.id === p.id ? 'Seleccionada' : 'Inspeccionar' }}
                      </button>
                    </td>
                  </tr>
                } @empty {
                  @if (!loading()) {
                    <tr>
                      <td colspan="5" class="text-center py-8 text-slate-400 text-xs">
                        No hay solicitudes de aprobación pendientes en la base de datos.
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- PANEL DE INSPECCIÓN DETALLE (DERECHA) -->
        <div class="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
          @if (selected(); as p) {
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-base">{{ p.code }}</span>
                  <span class="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                    {{ p.status }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">Vence: {{ p.expiresAt | date:'medium' }}</p>
              </div>

              <button 
                (click)="downloadPdfCurrent()" 
                class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar comprobante en PDF">
                📄 Descargar PDF
              </button>
            </div>

            <!-- Ficha del Cliente -->
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ficha del Cliente</span>
              <div class="font-bold text-slate-800">{{ p.customer.name }}</div>
              <div class="text-slate-600 text-[11px]">Doc: {{ p.customer.documentNumber }} • Tel: {{ p.customer.phone || 'No registrado' }}</div>
              <div class="text-slate-500 text-[11px] truncate">Dir: {{ p.customer.address || 'No especificada' }}</div>
            </div>

            <!-- Desglose de Repuestos -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Desglose de Repuestos ({{ p.details ? p.details.length : 0 }} Ítems)</span>
                <span class="text-[10px] text-slate-400">Moneda: PEN (S/)</span>
              </div>

              <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                @for (d of p.details; track d.id) {
                  <div class="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">{{ d.product.internalCode }}</span>
                        <span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">Tier {{ d.priceTier }}</span>
                      </div>
                      <div class="font-semibold text-slate-800 mt-1 leading-snug">{{ d.product.name }}</div>
                      <div class="text-[10px] text-slate-500">Cant: {{ d.quantity }} un (S/ {{ toNumber(d.unitPrice).toFixed(2) }} c/u) • Marca: {{ d.product.brand }}</div>
                    </div>
                    <div class="text-right font-mono font-bold text-slate-900">
                      S/ {{ toNumber(d.subtotal).toFixed(2) }}
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Importes Calculados -->
            <div class="border-t border-slate-200 pt-3 space-y-1 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Subtotal (Base):</span>
                <span class="font-mono">S/ {{ (toNumber(p.totalAmount) / 1.18).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>IGV (18%):</span>
                <span class="font-mono">S/ {{ (toNumber(p.totalAmount) - (toNumber(p.totalAmount) / 1.18)).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
                <span>Total Final:</span>
                <span class="font-mono text-emerald-700 text-base">S/ {{ toNumber(p.totalAmount).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Sustento del vendedor si existe en logs -->
            @if (p.statusLogs && p.statusLogs.length > 0 && p.statusLogs[0].reason) {
              <div class="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 text-[11px]">
                <span class="font-bold text-amber-900 block mb-0.5">Sustento del Asesor:</span>
                <p class="text-amber-800 italic">"{{ p.statusLogs[0].reason }}"</p>
              </div>
            }

            <!-- Acciones -->
            <div class="grid grid-cols-2 gap-2 pt-2">
              <button 
                (click)="approveCurrent()"
                [disabled]="actionLoading()"
                class="w-full bg-[#064e3b] hover:bg-emerald-900 text-white font-semibold py-2.5 px-3 rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                <span>✓</span> Aprobar Proforma [F8]
              </button>
              <button 
                (click)="openRejectModal()"
                [disabled]="actionLoading()"
                class="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-2.5 px-3 rounded-lg text-xs border border-red-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                <span>✕</span> Rechazar Proforma [F9]
              </button>
            </div>
          } @else {
            <div class="py-16 text-center text-slate-400 text-xs">
              Selecciona una proforma de la lista para inspeccionar.
            </div>
          }
        </div>
      </div>

      <!-- MODAL DE RECHAZO -->
      @if (showRejectModal()) {
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
              <div class="flex items-center gap-2">
                <span class="text-red-600 font-bold">⚠️</span>
                <h3 class="font-bold text-slate-900 text-sm">Rechazar Solicitud Tier 3</h3>
              </div>
              <button (click)="closeRejectModal()" class="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
            </div>

            <div class="p-4 space-y-3 text-xs">
              <p class="text-slate-600">
                Seleccione el motivo gerencial para rechazar la proforma <strong class="text-slate-900">{{ selected()?.code }}</strong>:
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
                (click)="closeRejectModal()"
                class="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors cursor-pointer">
                Cancelar
              </button>
              <button 
                (click)="confirmReject()"
                [disabled]="actionLoading()"
                class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50">
                {{ actionLoading() ? 'Rechazando...' : 'Confirmar Rechazo [F9]' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ApprovalsListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly proformasService = inject(ProformasService);
  private readonly toast = inject(ToastService);
  private readonly API_URL = 'http://localhost:3000/proformas';

  proformas = signal<ProformaApiDto[]>([]);
  selected = signal<ProformaApiDto | null>(null);
  loading = signal(false);
  actionLoading = signal(false);

  showRejectModal = signal(false);
  selectedReason = 'Margen insuficiente (<15%)';
  customNote = '';

  pendingCount = computed(() => this.proformas().length);
  totalPendingAmount = computed(() =>
    this.proformas().reduce((acc, p) => acc + this.toNumber(p.totalAmount), 0)
  );

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (this.showRejectModal()) return;

    if (event.key === 'F8') {
      event.preventDefault();
      this.approveCurrent();
    } else if (event.key === 'F9') {
      event.preventDefault();
      this.openRejectModal();
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<ProformaApiDto[]>(`${this.API_URL}?status=PENDING_APPROVAL`).subscribe({
      next: (data) => {
        const items = data || [];
        this.proformas.set(items);
        this.selected.set(items.length > 0 ? items[0] : null);
        this.proformasService.pendingApprovalsCount.set(items.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.show(err.error?.message || 'Error al cargar proformas pendientes', 'error');
      }
    });
  }

  private removeProformaFromView(id: string): void {
    const updated = this.proformas().filter((p) => p.id !== id);
    this.proformas.set(updated);
    this.selected.set(updated.length > 0 ? updated[0] : null);
    this.proformasService.pendingApprovalsCount.set(updated.length);
  }

  selectProforma(p: ProformaApiDto): void {
    this.selected.set(p);
  }

  toNumber(val: number | string | null | undefined): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return 0;
  }

  approveCurrent(): void {
    const current = this.selected();
    if (!current || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.http.patch(`${this.API_URL}/${current.id}/approve`, {}).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.removeProformaFromView(current.id);
        this.toast.show(`Proforma ${current.code} aprobada con éxito`, 'success');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.show(err.error?.message || 'Error al aprobar la proforma', 'error');
      }
    });
  }

  openRejectModal(): void {
    if (!this.selected()) return;
    this.customNote = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
  }

  confirmReject(): void {
    const current = this.selected();
    if (!current || this.actionLoading()) return;

    const fullReason = this.customNote.trim()
      ? `${this.selectedReason}: ${this.customNote.trim()}`
      : this.selectedReason;

    this.actionLoading.set(true);
    this.http.patch(`${this.API_URL}/${current.id}/reject`, { reason: fullReason }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeRejectModal();
        this.removeProformaFromView(current.id);
        this.toast.show(`Proforma ${current.code} rechazada`, 'info');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.show(err.error?.message || 'Error al rechazar la proforma', 'error');
      }
    });
  }

  downloadPdfCurrent(): void {
    const current = this.selected();
    if (!current) return;
    this.proformasService.downloadPdf(current.id, current.code);
  }
}