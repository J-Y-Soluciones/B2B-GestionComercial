import { Component, OnInit, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProformasApiService } from '../../core/api/proformas-api.service';
import { ToastService } from '../../core/services/toast.service';
import { ProformasHeaderComponent } from './components/proformas-header.component';
import { ProformasKpisComponent } from './components/proformas-kpis.component';
import { ProformasFiltersComponent, type StatusTab } from './components/proformas-filters.component';
import { ProformasTableComponent } from './components/proformas-table.component';
import { ProformasPaginationComponent } from './components/proformas-pagination.component';
import type { Proforma } from '../../core/models/proforma.model';

@Component({
  selector: 'app-proformas-list',
  standalone: true,
  imports: [
    CommonModule,
    ProformasHeaderComponent,
    ProformasKpisComponent,
    ProformasFiltersComponent,
    ProformasTableComponent,
    ProformasPaginationComponent
  ],
  template: `
    <div class="space-y-4">
      <app-proformas-header (refresh)="loadProformas()" (exportExcel)="exportExcel()" />

      <app-proformas-kpis 
        [totalCount]="proformas().length" 
        [approvedCount]="approvedCount()" 
        [pendingCount]="pendingCount()" 
        [totalAmount]="totalAmount()" />

      <app-proformas-filters 
        [tabs]="statusTabs()" 
        [selectedStatus]="selectedStatus()" 
        [searchQuery]="searchQuery()" 
        [onlyTier3]="onlyTier3()" 
        (statusChange)="onStatusChange($event)" 
        (searchChange)="onSearchChange($event)" 
        (tier3Toggle)="onTier3Toggle($event)" />

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <app-proformas-table 
          [proformas]="paginatedProformas()" 
          [downloadingId]="downloadingId()" 
          (downloadPdf)="onDownloadPdf($event)" 
          (facturar)="onFacturar($event)" />

        <app-proformas-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()" 
          [totalItems]="filteredProformas().length" 
          [startIndex]="startIndex()" 
          [endIndex]="endIndex()" 
          [pagesArray]="pagesArray()" 
          (pageChange)="currentPage.set($event)" />
      </div>
    </div>
  `
})
export class ProformasListComponent implements OnInit {
  private readonly api = inject(ProformasApiService);
  private readonly toast = inject(ToastService);

  proformas = signal<Proforma[]>([]);
  searchQuery = signal('');
  selectedStatus = signal('ALL');
  onlyTier3 = signal(false);
  currentPage = signal(1);
  pageSize = signal(6);
  downloadingId = signal<string | null>(null);

  @HostListener('window:keydown', ['$event'])
  handleShortcuts(e: KeyboardEvent): void {
    if (e.key === 'F5') { e.preventDefault(); this.loadProformas(); }
  }

  filteredProformas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    const t3 = this.onlyTier3();

    return this.proformas().filter((p) => {
      const matchStatus = st === 'ALL' || p.status === st;
      const matchQ = !q || p.code.toLowerCase().includes(q) || p.customer?.name?.toLowerCase().includes(q);
      const matchT3 = !t3 || p.details?.some((d: any) => d.priceTier === 3);
      return matchStatus && matchQ && matchT3;
    });
  });

  paginatedProformas = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProformas().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredProformas().length / this.pageSize()) || 1);
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  startIndex = computed(() => this.filteredProformas().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredProformas().length));

  approvedCount = computed(() => this.proformas().filter(p => p.status === 'APPROVED').length);
  pendingCount = computed(() => this.proformas().filter(p => p.status === 'PENDING_APPROVAL').length);
  totalAmount = computed(() => this.proformas().reduce((acc, p) => acc + Number(p.totalAmount || 0), 0));

  statusTabs = computed<StatusTab[]>(() => [
    { key: 'ALL', label: 'Todas', count: this.proformas().length },
    { key: 'APPROVED', label: 'Listas para Facturar', count: this.approvedCount(), icon: '🟢' },
    { key: 'PENDING_APPROVAL', label: 'Pendientes T3', count: this.pendingCount(), icon: '⚠️' },
    { key: 'REJECTED', label: 'Rechazadas', count: this.proformas().filter(p => p.status === 'REJECTED').length }
  ]);

  ngOnInit(): void { this.loadProformas(); }

  loadProformas(): void {
    this.api.getAll().subscribe({
      next: (res) => this.proformas.set(res || []),
      error: () => this.toast.show('Error al cargar proformas', 'error')
    });
  }

  onSearchChange(val: string): void { this.searchQuery.set(val); this.currentPage.set(1); }
  onStatusChange(val: string): void { this.selectedStatus.set(val); this.currentPage.set(1); }
  onTier3Toggle(val: boolean): void { this.onlyTier3.set(val); this.currentPage.set(1); }

  onDownloadPdf(p: Proforma): void {
    this.downloadingId.set(p.id);
    this.api.downloadPdf(p.id, `${p.code}.pdf`).subscribe({
      next: () => { this.downloadingId.set(null); this.toast.show(`PDF descargado`, 'success'); },
      error: () => { this.downloadingId.set(null); this.toast.show('Error al descargar PDF', 'error'); }
    });
  }

  onFacturar(p: Proforma): void {
    this.toast.show(`Proforma ${p.code} lista para facturación`, 'info');
  }

  exportExcel(): void {
    this.toast.show('Exportación programada para la siguiente fase', 'info');
  }
}