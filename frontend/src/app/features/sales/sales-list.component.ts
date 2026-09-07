import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesApiService } from '../../core/api/sales-api.service';
import { ToastService } from '../../core/services/toast.service';
import { SalesKpisComponent } from './components/sales-kpis.component';
import { SalesTableComponent } from './components/sales-table.component';
import { SalesAuditDrawerComponent } from './components/sales-audit-drawer.component';
import type { Sale } from '../../core/models/sale.model';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SalesKpisComponent,
    SalesTableComponent,
    SalesAuditDrawerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight">Historial de Ventas & Trazabilidad</h1>
          <p class="text-xs text-slate-500 mt-0.5">Control fiscal B2B, comprobantes y auditoría transaccional</p>
        </div>
        <button type="button" (click)="goToCheckout()"
                class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer">
          + Nueva Venta Directa
        </button>
      </div>

      <app-sales-kpis
        [totalSales]="totalAmountSum()"
        [salesCount]="activeSalesCount()"
        [invoicesCount]="invoicesCount()"
        [averageMargin]="grossMargin()" />

      <app-sales-table
        [sales]="sales()"
        (viewAudit)="selectedSaleForAudit.set($event)"
        (requestCancel)="openCancelModal($event)" />

      <app-sales-audit-drawer
        [sale]="selectedSaleForAudit()"
        (close)="selectedSaleForAudit.set(null)" />

      <!-- Modal de Anulación / Devolución de Stock -->
      @if (saleToCancel()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ↩
            </div>
            <div class="text-center">
              <h3 class="text-sm font-bold text-slate-900">Anular Venta {{ saleToCancel()?.code }}</h3>
              <p class="text-xs text-slate-500 mt-1">
                Se anulará el comprobante fiscal y se devolverán los repuestos al Kardex físico.
              </p>
            </div>

            <div class="space-y-1 text-left">
              <label class="text-[11px] font-bold text-slate-600">Motivo de Anulación / Devolución:</label>
              <textarea [(ngModel)]="cancelReason" rows="2" placeholder="Ej: Error en repuesto solicitado por cliente..."
                        class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500"></textarea>
            </div>

            <div class="flex gap-2 pt-2">
              <button type="button" (click)="saleToCancel.set(null)"
                      class="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" (click)="confirmCancelSale()" [disabled]="isCancelling()"
                      class="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors cursor-pointer">
                {{ isCancelling() ? 'Procesando...' : 'Confirmar Anulación' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SalesListComponent implements OnInit {
  private readonly salesApi = inject(SalesApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  sales = signal<Sale[]>([]);
  selectedSaleForAudit = signal<Sale | null>(null);
  saleToCancel = signal<Sale | null>(null);
  cancelReason = '';
  isCancelling = signal(false);

  private isSaleCancelled(sale: Sale): boolean {
    return sale.invoice?.status === 'ANULLED' || !!sale.notes?.includes('[ANULADA]');
  }

  totalAmountSum = computed(() => {
    return this.sales()
      .filter(s => !this.isSaleCancelled(s))
      .reduce((acc, s) => acc + Number(s.totalAmount), 0);
  });

  activeSalesCount = computed(() => {
    return this.sales().filter(s => !this.isSaleCancelled(s)).length;
  });

  invoicesCount = computed(() => {
    return this.sales().filter(s => !this.isSaleCancelled(s) && !!s.invoice).length;
  });

  grossMargin = computed(() => {
    const activeSales = this.sales().filter(s => !this.isSaleCancelled(s));
    if (activeSales.length === 0) return 0;

    let totalRevenue = 0;
    let totalCost = 0;

    for (const sale of activeSales) {
      totalRevenue += Number(sale.subtotal);
      for (const item of sale.details || []) {
        totalCost += Number(item.costPrice || 0) * item.quantity;
      }
    }

    if (totalRevenue === 0) return 0;
    const margin = ((totalRevenue - totalCost) / totalRevenue) * 100;
    return Number(margin.toFixed(1));
  });

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    this.salesApi.getAll().subscribe({
      next: (data) => this.sales.set(data),
      error: () => this.sales.set([])
    });
  }

  openCancelModal(sale: Sale) {
    this.cancelReason = '';
    this.saleToCancel.set(sale);
  }

  confirmCancelSale() {
    const sale = this.saleToCancel();
    if (!sale) return;

    this.isCancelling.set(true);
    const reason = this.cancelReason.trim() || 'Desistimiento / cambio de repuesto';

    this.salesApi.cancelSale(sale.id, reason).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.saleToCancel.set(null);
        this.toast.show(`Venta ${sale.code} anulada y stock devuelto a Kardex.`, 'success');
        this.loadSales();
      },
      error: (err) => {
        this.isCancelling.set(false);
        this.toast.show(err.error?.message || 'Error al anular la venta.', 'error');
      }
    });
  }

  goToCheckout() {
    this.router.navigate(['/sales/checkout']);
  }
}