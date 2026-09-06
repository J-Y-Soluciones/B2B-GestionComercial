import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ProformasService } from '../../core/services/proformas.service';
import { ToastService } from '../../core/services/toast.service';
import { ApprovalsKpisComponent } from './components/approvals-kpis.component';
import { ApprovalsTableComponent } from './components/approvals-table.component';
import { ApprovalsDetailPanelComponent } from './components/approvals-detail-panel.component';
import { ApprovalsRejectModalComponent } from './components/approvals-reject-modal.component';

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
  seller?: { email: string };
  customer: {
    id: string;
    name: string;
    documentNumber: string;
    phone?: string;
    address?: string;
    type: string;
  };
  details: ProformaDetailDto[];
  statusLogs?: { reason?: string; changedBy?: { email: string } }[];
}

@Component({
  selector: 'app-approvals-list',
  standalone: true,
  imports: [
    CommonModule,
    ApprovalsKpisComponent,
    ApprovalsTableComponent,
    ApprovalsDetailPanelComponent,
    ApprovalsRejectModalComponent
  ],
  template: `
    <div class="space-y-4">
      <!-- HEADER -->
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

      <!-- KPIS -->
      <app-approvals-kpis 
        [totalPendingAmount]="totalPendingAmount()" 
        [pendingCount]="pendingCount()" 
        [totalLoaded]="proformas().length" />

      <!-- SPLIT VIEW: MASTER / DETAIL -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div class="lg:col-span-7">
          <app-approvals-table 
            [proformas]="proformas()" 
            [selectedId]="selected()?.id" 
            [loading]="loading()" 
            (select)="selected.set($event)" />
        </div>

        <div class="lg:col-span-5">
          <app-approvals-detail-panel 
            [proforma]="selected()" 
            [actionLoading]="actionLoading()" 
            (approve)="approveCurrent()" 
            (reject)="showRejectModal.set(true)" 
            (downloadPdf)="downloadPdfCurrent()" />
        </div>
      </div>

      <!-- MODAL RECHAZO -->
      @if (showRejectModal() && selected()) {
        <app-approvals-reject-modal 
          [code]="selected()!.code" 
          [loading]="actionLoading()" 
          (close)="showRejectModal.set(false)" 
          (confirm)="confirmReject($event)" />
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

  pendingCount = computed(() => this.proformas().length);
  totalPendingAmount = computed(() =>
    this.proformas().reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0)
  );

  @HostListener('window:keydown', ['$event'])
  handleShortcuts(event: KeyboardEvent): void {
    if (this.showRejectModal()) return;
    if (event.key === 'F8') {
      event.preventDefault();
      this.approveCurrent();
    } else if (event.key === 'F9') {
      event.preventDefault();
      this.showRejectModal.set(true);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<ProformaApiDto[]>(`${this.API_URL}?status=PENDING_APPROVAL`).subscribe({
      next: (items) => {
        const data = items || [];
        this.proformas.set(data);
        this.selected.set(data.length > 0 ? data[0] : null);
        this.proformasService.pendingApprovalsCount.set(data.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.show(err.error?.message || 'Error al cargar pendientes', 'error');
      }
    });
  }

  approveCurrent(): void {
    const current = this.selected();
    if (!current || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.http.patch(`${this.API_URL}/${current.id}/approve`, {}).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.removeProforma(current.id);
        this.toast.show(`Proforma ${current.code} aprobada con éxito`, 'success');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.show(err.error?.message || 'Error al aprobar', 'error');
      }
    });
  }

  confirmReject(reason: string): void {
    const current = this.selected();
    if (!current || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.http.patch(`${this.API_URL}/${current.id}/reject`, { reason }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showRejectModal.set(false);
        this.removeProforma(current.id);
        this.toast.show(`Proforma ${current.code} rechazada`, 'info');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toast.show(err.error?.message || 'Error al rechazar', 'error');
      }
    });
  }

  private removeProforma(id: string): void {
    const updated = this.proformas().filter((p) => p.id !== id);
    this.proformas.set(updated);
    this.selected.set(updated.length > 0 ? updated[0] : null);
    this.proformasService.pendingApprovalsCount.set(updated.length);
  }

  downloadPdfCurrent(): void {
    const current = this.selected();
    if (current) this.proformasService.downloadPdf(current.id, current.code);
  }
}