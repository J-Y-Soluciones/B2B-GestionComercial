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
    <div class="space-y-4 sm:space-y-5 font-sans">
      <!-- HEADER ESTANDARIZADO -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            COMERCIAL &bull; CAJA &bull; HISTORIAL FISCAL
          </div>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
              Historial de Ventas &amp; Trazabilidad
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Cierre Diario
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Registro contable, comprobantes electrónicos emitidos y auditoría de Kardex.
          </p>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" (click)="goToCheckout()"
            class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
            <span>+</span>
            <span>Nueva Venta Directa</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-200 px-1 rounded">F8</kbd>
          </button>
        </div>
      </div>

      <!-- KPIS -->
      <app-sales-kpis
        [totalSales]="totalAmountSum()"
        [salesCount]="activeSalesCount()"
        [invoicesCount]="invoicesCount()"
        [averageMargin]="grossMargin()" />

      <!-- TABLA / CARDS -->
      <app-sales-table
        [sales]="sales()"
        (viewAudit)="selectedSaleForAudit.set($event)"
        (requestCancel)="openCancelModal($event)" />

      <!-- DRAWER DE AUDITORÍA -->
      <app-sales-audit-drawer
        [sale]="selectedSaleForAudit()"
        (close)="selectedSaleForAudit.set(null)" />

      <!-- MODAL DE ANULACIÓN / REVERSA DE KARDEX -->
      @if (saleToCancel()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ↩
            </div>
            <div class="text-center">
              <h3 class="text-sm font-bold text-slate-900">Anular Venta {{ saleToCancel()?.code }}</h3>
              <p class="text-xs text-slate-500 mt-1">
                Se anulará el comprobante y los repuestos retornarán automáticamente al inventario.
              </p>
            </div>

            <div class="space-y-1 text-left">
              <label class="text-[10px] font-mono font-bold uppercase text-slate-500 block">Motivo de Anulación / Devolución:</label>
              <textarea [(ngModel)]="cancelReason" rows="2" placeholder="Ej: Error en repuesto solicitado o desistimiento..."
                class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-rose-500 transition-colors"></textarea>
            </div>

            <div class="flex gap-2 pt-1">
              <button type="button" (click)="saleToCancel.set(null)"
                class="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" (click)="confirmCancelSale()" [disabled]="isCancelling()"
                class="flex-1 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer">
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
    return this.sales().filter(
      s => !this.isSaleCancelled(s) &&
        !!s.invoice &&
        (s.invoice.series === 'B001' || s.invoice.series === 'F001')
    ).length;
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