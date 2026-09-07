// src/app/features/checkout/checkout.component.ts
import { Component, OnInit, inject, signal, computed, HostListener, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesApiService } from '../../core/api/sales-api.service';
import { ProformasService, type ProformaDto } from '../../core/services/proformas.service';
import { ToastService } from '../../core/services/toast.service';
import { CheckoutHeaderComponent } from './components/checkout-header.component';
import { CheckoutProformaPickerComponent } from './components/checkout-proforma-picker.component';
import { CheckoutCustomerCardComponent } from './components/checkout-customer-card.component';
import { CheckoutItemsTableComponent, type CheckoutTableItem } from './components/checkout-items-table.component';
import { CheckoutTotalsComponent } from './components/checkout-totals.component';
import { CheckoutPaymentFormComponent } from './components/checkout-payment-form.component';
import { CheckoutCustomerPickerModalComponent } from './components/checkout-customer-picker-modal.component';
import type { CreateSalePayload, InvoiceType, PaymentMethod } from '../../core/models/sale.model';
import type { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    CheckoutHeaderComponent,
    CheckoutProformaPickerComponent,
    CheckoutCustomerCardComponent,
    CheckoutItemsTableComponent,
    CheckoutTotalsComponent,
    CheckoutPaymentFormComponent,
    CheckoutCustomerPickerModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">
      <app-checkout-header
        [hasActiveProforma]="!!proformaId()"
        (discard)="showDiscardModal.set(true)"
        (openPicker)="openPicker()"
        (returnToProformas)="returnToProformas()" />

      @if (proformaId()) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-8 space-y-6">
            <app-checkout-customer-card
              [proformaCode]="proformaCode()"
              [isApproved]="isApproved()"
              [issuedAt]="issuedAt()"
              [customerName]="customerName()"
              [documentNumber]="documentNumber()"
              [customerAddress]="customerAddress()"
              (openCustomerSearch)="showCustomerPicker.set(true)" />

            <!-- Modal Reasignar Cliente -->
            @if (showCustomerPicker()) {
              <app-checkout-customer-picker-modal
                (close)="showCustomerPicker.set(false)"
                (customerSelected)="onCustomerReassigned($event)" />
            }

            <app-checkout-items-table [items]="items()" (supplierChanged)="onSupplierChange($event)" />
            <app-checkout-totals [total]="totalAmount()" />
          </div>

          <div class="lg:col-span-4">
            <app-checkout-payment-form
            [totalAmount]="totalAmount()"
            [customerDocument]="documentNumber()"
            [sunatEnabled]="sunatEnabled()"
            [hasStockError]="hasStockDeficit()"
            [isSubmitting]="isSubmitting()"
            (toggleSunat)="toggleSunatState()"
            (submitPayment)="processSale($event)" />
          </div>
        </div>
      } @else {
        <app-checkout-proforma-picker [proformas]="availableProformas()" (selectProforma)="onSelectProforma($event)" />
      }

      @if (showModal()) {
        <app-checkout-proforma-picker
          [proformas]="availableProformas()"
          [isModal]="true"
          (selectProforma)="onSelectProforma($event)"
          (closeModal)="showModal.set(false)" />
      }

      <!-- Modal de Confirmación Estilizado -->
      @if (showDiscardModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">¿Descartar Operación?</h3>
              <p class="text-xs text-slate-500 mt-1">
                El cliente no continuará con la compra. La cotización se marcará como cancelada y no afectará el inventario.
              </p>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="button" (click)="showDiscardModal.set(false)"
                      class="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                Continuar Venta
              </button>
              <button type="button" (click)="confirmDiscard()"
                      class="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer">
                Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly salesApi = inject(SalesApiService);
  private readonly proformasService = inject(ProformasService);
  private readonly toast = inject(ToastService);

  paymentForm = viewChild(CheckoutPaymentFormComponent);
  proformaId = signal<string | undefined>(undefined);
  customerId = signal<string>('');
  proformaCode = signal<string>('');
  isApproved = signal<boolean>(true);
  issuedAt = signal<Date | string>(new Date());
  customerName = signal<string>('');
  documentNumber = signal<string>('');
  customerAddress = signal<string | undefined>(undefined);
  sunatEnabled = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  items = signal<CheckoutTableItem[]>([]);
  totalAmount = signal<number>(0);
  availableProformas = signal<ProformaDto[]>([]);
  showModal = signal<boolean>(false);
  showDiscardModal = signal<boolean>(false);
  showCustomerPicker = signal<boolean>(false);

  ngOnInit(): void {
    this.loadReadyProformas();
    const id = this.route.snapshot.paramMap.get('proformaId');
    if (id) this.onSelectProforma(id);
  }

  loadReadyProformas(): void {
    this.proformasService.getProformas().subscribe((list) => {
      const ready = list
        .filter((p) => p.status === 'APPROVED' || p.status === 'PENDING')
        .map((p: any) => {
          if (p.details && p.details.length > 0) {
            const realTotal = p.details.reduce(
              (acc: number, d: any) => acc + (Number(d.quantity) * Number(d.unitPrice)),
              0
            );
            return { ...p, totalAmount: Number(realTotal.toFixed(2)) };
          }
          return p;
        });

      this.availableProformas.set(ready);
    });
  }

  hasStockDeficit = computed(() => {
    return this.items().some((item) => {
      const selectedSup = item.availableSuppliers.find((s) => s.id === item.supplierId);
      return !selectedSup || selectedSup.stock < item.quantity;
    });
  });

  // En checkout.component.ts -> onSelectProforma
  onSelectProforma(id: string): void {
    this.proformaId.set(id);
    this.showModal.set(false);
    this.proformasService.getById(id).subscribe({
      next: (prof: any) => {
        this.proformaCode.set(prof.code);
        this.customerId.set(prof.customer?.id || '');
        this.isApproved.set(prof.status === 'APPROVED' || prof.status === 'PENDING');
        this.issuedAt.set(prof.createdAt);
        this.customerName.set(prof.customer?.name || 'Cliente Mostrador');
        this.documentNumber.set(prof.customer?.documentNumber || '-');
        this.customerAddress.set(prof.customer?.address ?? undefined);

        const mappedItems: CheckoutTableItem[] = (prof.details || []).map((d: any) => {
          const qty = Number(d.quantity);
          const price = Number(d.unitPrice);
          const lineSubtotal = Number((qty * price).toFixed(2));

          const realSuppliers: { id: string; name: string; stock: number }[] = (d.product?.stocks || []).map((st: any) => ({
            id: st.supplierId,
            name: st.supplier?.name || 'Proveedor General',
            stock: Number(st.stock || 0)
          }));

          const savedSupplier = realSuppliers.find(s => s.id === d.supplierId);
          const selectedSupplier = savedSupplier || realSuppliers.find(s => s.stock >= qty) || realSuppliers[0];

          return {
            productId: d.productId,
            code: d.product?.internalCode || 'SKU',
            name: d.product?.name || 'Repuesto',
            brand: d.product?.brand || 'Genérico',
            quantity: qty,
            unitPrice: price,
            priceTier: d.priceTier,
            subtotal: lineSubtotal,
            supplierId: selectedSupplier ? selectedSupplier.id : '',
            availableSuppliers: realSuppliers
          };
        });

        this.items.set(mappedItems);

        const calculatedTotal = mappedItems.reduce((acc, item) => acc + item.subtotal, 0);
        this.totalAmount.set(Number(calculatedTotal.toFixed(2)));
      },
      error: () => this.toast.show('Error al cargar la proforma.', 'error')
    });
  }

  // Manejador invocado al seleccionar o registrar un cliente desde el modal
  onCustomerReassigned(customer: Customer): void {
    this.customerId.set(customer.id);
    this.customerName.set(customer.name);
    this.documentNumber.set(customer.documentNumber);
    this.customerAddress.set(customer.address ?? undefined);
    this.showCustomerPicker.set(false);
    this.toast.show(`Cliente reasignado a: ${customer.name}`, 'success');
  }

  confirmDiscard(): void {
    const currentId = this.proformaId();
    this.showDiscardModal.set(false);
    if (!currentId) return;

    this.proformasService.cancelProforma(currentId).subscribe({
      next: () => {
        this.toast.show('Operación cancelada y cotización descartada.', 'info');
        this.clearCheckoutView();
      },
      error: (err) => {
        // Rompe el bloqueo visual aunque el backend rechace la orden
        this.toast.show(err.error?.message || 'Operación retirada del mostrador.', 'info');
        this.clearCheckoutView();
      }
    });
  }

  private clearCheckoutView(): void {
    this.proformaId.set(undefined);
    this.items.set([]);
    this.totalAmount.set(0);
    this.loadReadyProformas();
  }

  openPicker(): void {
    this.loadReadyProformas();
    this.showModal.set(true);
  }

  onSupplierChange(ev: { productId: string; supplierId: string }): void {
    this.items.update((list) =>
      list.map((i) => (i.productId === ev.productId ? { ...i, supplierId: ev.supplierId } : i))
    );
  }

  toggleSunatState(): void {
    this.sunatEnabled.update((v) => !v);
    this.toast.show(`Modo SUNAT ${this.sunatEnabled() ? 'Activado' : 'Desactivado (Boleta Simple)'}`, 'info');
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.returnToProformas();
    } else if (e.key === 'F8') {
      e.preventDefault();
      // Si el modal de búsqueda o el modal de descarte están abiertos, no procesar venta
      if (this.showCustomerPicker() || this.showDiscardModal() || this.showModal()) {
        return;
      }
      // Ejecuta el submit del formulario hijo directamente
      this.paymentForm()?.onProcessSale();
    }
  }

  returnToProformas(): void {
    this.router.navigate(['/proformas']);
  }

  processSale(payment: {
    type: InvoiceType;
    method: PaymentMethod;
    receivedAmount?: number;
    changeAmount?: number;
    operationCode?: string;
  }): void {
    this.isSubmitting.set(true);
    const payload: CreateSalePayload = {
      proformaId: this.proformaId(),
      customerId: this.customerId(),
      invoiceType: payment.type,
      items: this.items().map((i) => ({
        productId: i.productId,
        supplierId: i.supplierId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        priceTier: i.priceTier
      })),
      payments: [
        {
          method: payment.method,
          amount: this.totalAmount(),
          receivedAmount: payment.receivedAmount,
          changeAmount: payment.changeAmount,
          operationCode: payment.operationCode
        }
      ]
    };

    this.salesApi.createSale(payload).subscribe({
      next: (sale) => {
        this.isSubmitting.set(false);
        this.toast.show(`Venta ${sale.code} emitida exitosamente.`, 'success');
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.show(err.error?.message || 'Error al procesar la venta', 'error');
      }
    });
  }
}