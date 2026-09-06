// frontend/src/app/features/proformas/components/cotizador/cotizador.component.ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomersApiService } from '../../../../core/api/customers-api.service';
import { ProductsApiService } from '../../../../core/api/products-api.service';
import { ProformasApiService } from '../../../../core/api/proformas-api.service';
import { ProformasService } from '../../../../core/services/proformas.service';
import { ToastService } from '../../../../core/services/toast.service';
import type { Customer } from '../../../../core/models/customer.model';
import type { Product, SupplierStock } from '../../../../core/models/product.model';
import type { CreateProformaPayload } from '../../../../core/models/proforma.model';

export interface CotizadorCartItem {
    product: Product;
    quantity: number;
    selectedTier: number;
    unitPrice: number;
    subtotal: number;
    requiresApproval: boolean;
    selectedSupplierId?: string;
    selectedSupplierName?: string;
}

@Component({
    selector: 'app-cotizador',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cotizador.component.html',
    styleUrls: ['./cotizador.component.css'],
})
export class CotizadorComponent implements OnInit {
    private readonly customersApi = inject(CustomersApiService);
    private readonly productsApi = inject(ProductsApiService);
    private readonly proformasApi = inject(ProformasApiService);
    private readonly proformasService = inject(ProformasService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    // Cliente
    customerQuery = signal<string>('');
    customerSearchResults = signal<Customer[]>([]);
    isSearchingCustomer = signal<boolean>(false);
    selectedCustomer = signal<Customer | null>(null);

    // Catálogo de Repuestos
    productQuery = signal<string>('');
    productCategory = signal<string>('Todas');
    productSearchResults = signal<Product[]>([]);
    isSearchingProduct = signal<boolean>(false);
    categories = ['Todas', 'Frenos', 'Suspensión & Dirección', 'Motor & Culata', 'Filtros & Lubricantes', 'Transmisión 4x4'];

    // Selección interactiva de Proveedor por Producto: { [productId]: supplierStockId }
    selectedSupplierByProduct = signal<Record<string, string>>({});

    // Carrito / Matriz Transaccional
    cart = signal<CotizadorCartItem[]>([]);

    // Modal de Éxito y Feedback
    showSuccessModal = signal<boolean>(false);
    lastCreatedProforma = signal<{ id: string; code: string; status: string } | null>(null);
    formErrorMessage = signal<string | null>(null);

    // Computed Totales & Métricas
    subtotalNeto = computed(() => {
        return this.cart().reduce((acc, item) => acc + item.subtotal, 0);
    });

    igv = computed(() => {
        return Number((this.subtotalNeto() * 0.18).toFixed(2));
    });

    total = computed(() => {
        return Number((this.subtotalNeto() + this.igv()).toFixed(2));
    });

    totalItemsCount = computed(() => {
        return this.cart().reduce((acc, item) => acc + item.quantity, 0);
    });

    requiresManagerApproval = computed(() => {
        return this.cart().some((item) => item.requiresApproval);
    });

    isSubmitting = this.proformasApi.isSubmitting;

    ngOnInit(): void {
        this.searchProducts();
    }

    // Búsqueda Clientes
    onCustomerQueryChange(val: string): void {
        this.customerQuery.set(val);
        if (!val || val.trim().length < 2) {
            this.customerSearchResults.set([]);
            return;
        }
        this.isSearchingCustomer.set(true);
        this.customersApi.search(val.trim(), 5).subscribe({
            next: (res) => {
                this.customerSearchResults.set(res);
                this.isSearchingCustomer.set(false);
            },
            error: () => this.isSearchingCustomer.set(false),
        });
    }

    selectCustomer(customer: Customer): void {
        this.selectedCustomer.set(customer);
        this.customerSearchResults.set([]);
        this.customerQuery.set('');
        this.formErrorMessage.set(null);
    }

    clearCustomer(): void {
        this.selectedCustomer.set(null);
    }

    // Búsqueda Repuestos (activa desde el 3er carácter)
    onProductQueryChange(val: string): void {
        this.productQuery.set(val);
        const cleaned = val ? val.trim() : '';

        if (cleaned.length > 0 && cleaned.length < 3) {
            return;
        }

        this.searchProducts();
    }

    setCategory(cat: string): void {
        this.productCategory.set(cat);
        this.searchProducts();
    }

    searchProducts(): void {
        this.isSearchingProduct.set(true);
        const cat = this.productCategory() === 'Todas' ? undefined : this.productCategory();
        this.productsApi
            .search({
                query: this.productQuery(),
                category: cat,
                limit: 8,
            })
            .subscribe({
                next: (items) => {
                    this.productSearchResults.set(items);
                    this.isSearchingProduct.set(false);
                },
                error: () => this.isSearchingProduct.set(false),
            });
    }

    // Gestión interactiva del Proveedor activo en la tarjeta
    selectProductSupplier(productId: string, supplierStockId: string): void {
        this.selectedSupplierByProduct.update((prev) => ({
            ...prev,
            [productId]: supplierStockId,
        }));
    }

    getActiveStock(prod: Product): SupplierStock | undefined {
        if (!prod || !prod.stocks || prod.stocks.length === 0) return undefined;
        const selectedId = this.selectedSupplierByProduct()[prod.id];
        if (selectedId) {
            const found = prod.stocks.find((s: any) => s.id === selectedId || s.supplierId === selectedId);
            if (found) return found;
        }
        return prod.stocks[0];
    }

    getItemStockLimit(item: CotizadorCartItem): number {
        if (!item || !item.product || !item.product.stocks || item.product.stocks.length === 0) {
            return 0;
        }

        const stocks = item.product.stocks as any[];

        // 1. Coincidencia directa por IDs (stockId, supplierId, o supplier.id)
        if (item.selectedSupplierId) {
            const match = stocks.find((s) =>
                s.id === item.selectedSupplierId ||
                s.supplierId === item.selectedSupplierId ||
                s.supplier?.id === item.selectedSupplierId
            );
            if (match && match.stock !== undefined && match.stock !== null) {
                return Number(match.stock);
            }
        }

        // 2. Coincidencia por nombre del proveedor
        if (item.selectedSupplierName) {
            const targetName = item.selectedSupplierName.trim().toLowerCase();
            const matchByName = stocks.find((s) => {
                const sName = (s.supplierName || s.supplier?.name || '').trim().toLowerCase();
                return sName === targetName;
            });
            if (matchByName && matchByName.stock !== undefined && matchByName.stock !== null) {
                return Number(matchByName.stock);
            }
        }

        // 3. Fallback al primer stock numérico válido
        return Number(stocks[0]?.stock) || 0;
    }

    addToCart(product: Product, stockItem?: SupplierStock): void {
        this.formErrorMessage.set(null);

        const chosenStock = (stockItem ?? this.getActiveStock(product)) as any;
        if (!chosenStock) {
            this.toastService.show('No se pudo identificar el inventario del repuesto.', 'error');
            return;
        }

        const supplierId = chosenStock.supplierId || chosenStock.supplier?.id || chosenStock.id;
        const supplierName = chosenStock.supplierName || chosenStock.supplier?.name || 'Proveedor Seleccionado';
        const availableStock = Number(chosenStock.stock) || 0;

        if (availableStock <= 0) {
            this.toastService.show(`Sin existencias con ${supplierName}.`, 'error');
            return;
        }

        const existingIndex = this.cart().findIndex((i) =>
            i.product.id === product.id &&
            (i.selectedSupplierId === supplierId || i.selectedSupplierName === supplierName)
        );

        if (existingIndex > -1) {
            const currentQty = this.cart()[existingIndex].quantity;
            if (currentQty + 1 > availableStock) {
                this.toastService.show(
                    `Tope alcanzado: solo hay ${availableStock} unidades en ${supplierName}.`,
                    'error'
                );
                return;
            }
            this.updateQuantity(existingIndex, currentQty + 1);
            return;
        }

        const t1 = product.priceTiers.find((t) => t.tier === 1);
        const price = t1 ? Number(t1.price) : 0;

        const newItem: CotizadorCartItem = {
            product,
            quantity: 1,
            selectedTier: 1,
            unitPrice: price,
            subtotal: price,
            requiresApproval: false,
            selectedSupplierId: supplierId,
            selectedSupplierName: supplierName,
        };

        this.cart.update((prev) => [...prev, newItem]);
        this.toastService.show(`"${product.name}" agregado.`, 'info', 1500);
    }

    updateQuantity(index: number, newQty: number): void {
        if (newQty < 1) return;

        const item = this.cart()[index];
        const maxStock = this.getItemStockLimit(item);

        if (newQty > maxStock) {
            this.toastService.show(
                `Stock insuficiente: solo dispones de ${maxStock} unidades en ${item.selectedSupplierName || 'este proveedor'}.`,
                'error'
            );
            return;
        }

        this.cart.update((prev) => {
            const updated = [...prev];
            const currentItem = { ...updated[index] };
            currentItem.quantity = newQty;
            currentItem.subtotal = Number((currentItem.quantity * currentItem.unitPrice).toFixed(2));
            updated[index] = currentItem;
            return updated;
        });
    }

    onQuantityInput(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        let val = parseInt(input.value, 10);
        const item = this.cart()[index];
        const maxStock = this.getItemStockLimit(item);

        if (isNaN(val) || val < 1) {
            val = 1;
        } else if (val > maxStock) {
            this.toastService.show(
                `Stock máximo disponible: ${maxStock} unidades.`,
                'error'
            );
            val = maxStock;
        }

        input.value = val.toString();
        this.updateQuantity(index, val);
    }

    removeFromCart(index: number): void {
        this.cart.update((prev) => prev.filter((_, i) => i !== index));
    }

    setPriceTier(itemIndex: number, tierNumber: number): void {
        this.cart.update((prev) => {
            const updated = [...prev];
            const item = { ...updated[itemIndex] };
            const tierObj = item.product.priceTiers.find((t) => t.tier === tierNumber);
            if (tierObj) {
                item.selectedTier = tierNumber;
                item.unitPrice = Number(tierObj.price);
                item.subtotal = Number((item.quantity * item.unitPrice).toFixed(2));
                item.requiresApproval = tierNumber === 3;
            }
            updated[itemIndex] = item;
            return updated;
        });
    }

    getTierPrice(product: Product, tierNumber: number): number {
        const tier = product.priceTiers.find((t) => t.tier === tierNumber);
        return tier ? Number(tier.price) : 0;
    }

    // Emisión de Proforma
    submitProforma(): void {
        const customer = this.selectedCustomer();
        if (!customer) {
            this.formErrorMessage.set('Debe seleccionar o registrar un cliente antes de emitir la cotización.');
            return;
        }

        if (this.cart().length === 0) {
            this.formErrorMessage.set('Debe agregar al menos un repuesto a la cotización.');
            return;
        }

        // Validación estricta final de stock antes de enviar al backend
        for (const item of this.cart()) {
            const maxStock = this.getItemStockLimit(item);
            if (item.quantity > maxStock) {
                this.toastService.show(
                    `El repuesto "${item.product.name}" supera el stock disponible (${item.quantity} de ${maxStock}). Ajuste la cantidad.`,
                    'error'
                );
                return;
            }
        }

        this.formErrorMessage.set(null);

        const payload: CreateProformaPayload = {
            customerId: customer.id,
            items: this.cart().map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                priceTier: item.selectedTier,
            })),
        };

        this.proformasApi.create(payload).subscribe({
            next: (created) => {
                this.lastCreatedProforma.set({
                    id: created.id,
                    code: created.code,
                    status: created.status,
                });
                this.showSuccessModal.set(true);

                this.cart.set([]);
                this.selectedCustomer.set(null);
                this.customerQuery.set('');
                this.productQuery.set('');

                if (created.status === 'PENDING_APPROVAL') {
                    this.proformasService.refreshPendingCount();
                    this.toastService.show(`Proforma ${created.code} enviada a revisión gerencial.`, 'info');
                } else {
                    this.toastService.show(`Proforma ${created.code} generada exitosamente.`, 'success');
                }
            },
            error: (err) => {
                this.formErrorMessage.set(err?.error?.message || 'Error al emitir la proforma. Intente nuevamente.');
            },
        });
    }

    downloadAndClose(): void {
        const p = this.lastCreatedProforma();
        if (p) {
            this.proformasService.downloadPdf(p.id, p.code);
        }
        this.closeSuccessModal();
    }

    closeSuccessModal(): void {
        const status = this.lastCreatedProforma()?.status;
        this.showSuccessModal.set(false);
        this.lastCreatedProforma.set(null);

        if (status === 'PENDING_APPROVAL') {
            this.router.navigate(['/approvals']);
        } else {
            this.router.navigate(['/proformas']);
        }
    }
}