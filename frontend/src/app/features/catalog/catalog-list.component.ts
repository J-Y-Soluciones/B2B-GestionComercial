import { Component, OnInit, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsApiService } from '../../core/api/products-api.service';
import { SuppliersApiService, type SupplierItem } from '../../core/api/suppliers-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { StockModalComponent, type UpdateStockEvent } from './components/stock-modal.component';
import { ProductFormModalComponent, type ProductFormData } from './components/product-form-modal.component';
import type { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StockModalComponent, ProductFormModalComponent],
  template: `
    <div class="space-y-5">
      <!-- HEADER PRINCIPAL ESTILO STITCH -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            COMERCIAL &bull; INVENTARIO &bull; LISTA MAESTRA DE REPUESTOS
          </div>
          <div class="flex items-center gap-2.5 mt-0.5">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
              Catálogo Maestro de Repuestos & Stock Multi-Almacén
            </h1>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronizado SUNAT & ERP (Real-Time)
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button type="button" (click)="loadProducts()"
            class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
            <span>🔄</span> Actualizar <kbd class="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">F5</kbd>
          </button>
          <button type="button" disabled
            class="text-xs text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-not-allowed font-medium">
            <span>📥</span> 
            <span>Importar / Exportar Excel</span>
            <span class="text-[9px] font-mono bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-bold uppercase">
              Próximamente
            </span>
          </button>
          @if (canManageStock()) {
            <button type="button" (click)="openCreateModal()"
              class="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>+ Nuevo Repuesto</span>
              <kbd class="text-[9px] font-mono bg-emerald-900 text-emerald-200 px-1 rounded">F4</kbd>
            </button>
          }
        </div>
      </div>

      <!-- KPIS OPERATIVOS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- KPI 1 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Catálogo Activo B2B</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl font-black text-slate-900 font-mono">{{ products().length | number }}</span>
              <span class="text-xs font-semibold text-slate-500 font-mono">SKUs</span>
            </div>
            <span class="text-[10px] text-emerald-700 font-mono mt-0.5 block flex items-center gap-1">
              <span>✓</span> 94.2% habilitados para venta & proformas
            </span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-base">
            📦
          </div>
        </div>

        <!-- KPI 2 -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Stock Físico Consolidado</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl font-black text-slate-900 font-mono">{{ totalUnitsStock() | number }}</span>
              <span class="text-xs font-semibold text-slate-500 font-mono">Unidades</span>
            </div>
            <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">
              3 sucursales propias + {{ suppliers().length }} proveedores en red
            </span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-base">
            📈
          </div>
        </div>

        <!-- KPI 3 (Alerta Ámbar) -->
        <div class="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider">Bajo Stock Mínimo</span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-200 text-amber-900 uppercase">Urgente</span>
            </div>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl font-black text-amber-950 font-mono">{{ lowStockCount() }}</span>
              <span class="text-xs font-semibold text-amber-800 font-mono">Repuestos Críticos</span>
            </div>
            <span class="text-[10px] text-amber-700 font-mono mt-0.5 block">
              Requieren reposición o pedido a mayorista
            </span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-800 flex items-center justify-center text-base font-bold">
            ⚠️
          </div>
        </div>
      </div>

      <!-- PÍLDORAS DE LÍNEAS / CATEGORÍAS -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        @for (line of categoryLines(); track line.name) {
          <button type="button" (click)="setCategory(line.name)"
            [class]="selectedCategory() === line.name 
              ? 'bg-emerald-900 text-white font-bold shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5">
            <span>{{ line.name }}</span>
            <span class="text-[10px] font-mono opacity-80" [class]="selectedCategory() === line.name ? 'text-emerald-200' : 'text-slate-400'">
              {{ line.count }}
            </span>
          </button>
        }
      </div>

      <!-- BUSCADOR COMPACTO B2B -->
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-96">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar por SKU, Nº Parte OEM, Descripción o Marca..."
            class="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-14 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none font-sans" />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
          </svg>
          <kbd class="absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">CTRL+K</kbd>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto text-xs text-slate-500 font-mono">
          <span>Mostrando {{ filteredProducts().length }} repuestos registrados</span>
        </div>
      </div>

      <!-- TABLA PRINCIPAL DE CATÁLOGO B2B -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
                <th class="py-3 px-3 text-center w-10">#</th>
                <th class="py-3 px-4">SKU / Descripción & Marca</th>
                <th class="py-3 px-4">Categoría / OEM</th>
                <th class="py-3 px-4 text-center">Matriz de Precios B2B (Tiers)</th>
                <th class="py-3 px-4 text-center">Existencias Consolidadas</th>
                <th class="py-3 px-4 text-center">Estado Stock</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (filteredProducts().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                    No se encontraron repuestos con los criterios ingresados.
                  </td>
                </tr>
              }

              @for (prod of filteredProducts(); track prod.id; let idx = $index) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <!-- # Secuencial -->
                  <td class="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                    {{ (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1) }}
                  </td>

                  <!-- SKU y Descripción -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span [class]="getSkuBadgeColor(idx)" class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase">
                        {{ prod.internalCode }}
                      </span>
                      <span class="font-bold text-slate-900 text-xs">{{ prod.name }}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 mt-0.5">
                      <strong class="text-slate-700 font-semibold">{{ prod.brand }}</strong> &bull;
                      <span>Aplicación: General B2B</span>
                    </div>
                  </td>

                  <!-- Categoría y OEM -->
                  <td class="py-3 px-4">
                    <div class="text-slate-800 font-medium text-[11px]">{{ prod.category }}</div>
                    <div class="text-[10px] font-mono text-slate-400 mt-0.5">
                      # OEM: {{ getOemCode(prod) }}
                    </div>
                  </td>

                  <!-- Matriz de Precios B2B -->
                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1.5 font-mono text-[10px]">
                      <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                        T1 Normal: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 1) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                        T2 Taller: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 2) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold">
                        T3 Mayor: <strong class="text-emerald-950">S/ {{ getTierPrice(prod, 3) | number:'1.2-2' }}</strong>
                      </span>
                    </div>
                  </td>

                  <!-- Existencias Consolidadas con desglose -->
                  <td class="py-3 px-4 text-center">
                    <div class="font-mono font-black text-xs text-slate-900">
                      {{ prod.totalStock }} unidades en red
                    </div>
                    <div class="text-[9px] font-mono text-slate-400 mt-0.5">
                      Lima: {{ getStockBreakdown(prod, 0) }} &bull; Callao: {{ getStockBreakdown(prod, 1) }} &bull; Mayorista: {{ getStockBreakdown(prod, 2) }}
                    </div>
                  </td>

                  <!-- Estado Stock Badge Semántico -->
                  <td class="py-3 px-4 text-center">
                    @if (prod.totalStock === 0) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Agotado
                      </span>
                    } @else if (prod.totalStock <= prod.minStock) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Crítico ({{ prod.totalStock }} un)
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Stock Óptimo
                      </span>
                    }
                  </td>

                  <!-- Acciones -->
                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <button type="button" (click)="openStockModal(prod)"
                        class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                        ↗ Kardex ({{ prod.stocks ? prod.stocks.length : 0 }})
                      </button>
                      @if (canManageStock()) {
                        <button type="button" (click)="openEditModal(prod)"
                          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar Ficha Técnica">
                          ✏️
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODALES INTEGRADOS -->
      @if (selectedProductForStock()) {
        <app-stock-modal
          [product]="selectedProductForStock()"
          [suppliers]="suppliers()"
          [canManage]="canManageStock()"
          [isSaving]="isSavingStock()"
          (close)="closeStockModal()"
          (save)="handleStockUpdate($event)" />
      }

      @if (isProductModalOpen()) {
        <app-product-form-modal
          [product]="selectedProductForEdit()"
          [categories]="formCategories"
          [isSaving]="isSavingProduct()"
          (close)="closeProductModal()"
          (save)="handleProductSave($event)" />
      }
    </div>
  `
})
export class CatalogListComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  products = signal<Product[]>([]);
  suppliers = signal<SupplierItem[]>([]);
  isLoading = signal(false);
  isSavingStock = signal(false);
  isSavingProduct = signal(false);

  searchQuery = signal('');
  selectedCategory = signal('Todas las Líneas');

  formCategories = ['Frenos', 'Suspensión & Dirección', 'Motor & Culata', 'Filtros & Lubricantes', 'Transmisión & Embrague', 'Sistema Eléctrico'];

  selectedProductForStock = signal<Product | null>(null);
  selectedProductForEdit = signal<Product | null>(null);
  isProductModalOpen = signal(false);

  canManageStock = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'WAREHOUSE';
  });

  categoryLines = computed(() => {
    const all = this.products();
    const countByCat = (c: string) => all.filter(p => p.category === c).length;

    return [
      { name: 'Todas las Líneas', count: all.length },
      { name: 'Frenos', count: countByCat('Frenos') },
      { name: 'Suspensión & Dirección', count: countByCat('Suspensión & Dirección') },
      { name: 'Motor & Culata', count: countByCat('Motor & Culata') },
      { name: 'Filtros & Lubricantes', count: countByCat('Filtros & Lubricantes') },
      { name: 'Transmisión & Embrague', count: countByCat('Transmisión & Embrague') },
    ];
  });

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.products().filter((p) => {
      const matchCat = cat === 'Todas las Líneas' || p.category === cat;
      const matchQuery = !query ||
        p.name.toLowerCase().includes(query) ||
        p.internalCode.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  totalUnitsStock = computed(() => {
    return this.products().reduce((acc, p) => acc + (p.totalStock || 0), 0);
  });

  lowStockCount = computed(() => {
    return this.products().filter((p) => (p.totalStock || 0) <= (p.minStock || 5)).length;
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadSuppliers();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.key === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (this.canManageStock()) {
        this.openCreateModal();
      }
    } else if (event.key === 'F5') {
      event.preventDefault();
      event.stopPropagation();
      this.loadProducts();
    }
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productsApi.search({ limit: 100 }).subscribe({
      next: (res) => {
        this.products.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadSuppliers(): void {
    if (!this.canManageStock()) return;
    this.suppliersApi.getAll().subscribe({
      next: (res) => this.suppliers.set(res),
      error: () => { }
    });
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  getTierPrice(product: Product, tierNumber: number): number {
    const t = product.priceTiers?.find((item) => item.tier === tierNumber);
    return t ? Number(t.price) : 0;
  }

  getSkuBadgeColor(idx: number): string {
    const colors = [
      'bg-blue-50 text-blue-800 border-blue-200',
      'bg-amber-50 text-amber-800 border-amber-200',
      'bg-emerald-50 text-emerald-800 border-emerald-200',
      'bg-rose-50 text-rose-800 border-rose-200',
      'bg-purple-50 text-purple-800 border-purple-200',
    ];
    return colors[idx % colors.length];
  }

  getOemCode(prod: Product): string {
    const stockWithSku = prod.stocks?.find(s => s.supplierSku);
    return stockWithSku?.supplierSku || `${prod.internalCode}-OEM`;
  }

  getStockBreakdown(prod: Product, index: number): number {
    if (!prod.stocks || prod.stocks.length === 0) return 0;
    return prod.stocks[index]?.stock || 0;
  }

  exportExcelStub(): void {
    this.toast.show('Exportando lista maestra a formato Excel...', 'info');
  }

  // Modales
  openStockModal(product: Product): void {
    this.selectedProductForStock.set(product);
  }

  closeStockModal(): void {
    this.selectedProductForStock.set(null);
  }

  handleStockUpdate(event: UpdateStockEvent): void {
    const prod = this.selectedProductForStock();
    if (!prod) return;

    if (!event.supplierId) {
      this.toast.show('Seleccione un mayorista o almacén.', 'error');
      return;
    }

    this.isSavingStock.set(true);
    this.productsApi.setSupplierStock(prod.id, event).subscribe({
      next: () => {
        this.isSavingStock.set(false);
        this.toast.show(`Existencias actualizadas en Kardex para "${prod.name}".`, 'success');
        this.closeStockModal();
        this.loadProducts();
      },
      error: (err) => {
        this.isSavingStock.set(false);
        this.toast.show(err?.error?.message || 'Error al actualizar existencias.', 'error');
      }
    });
  }

  openCreateModal(): void {
    this.selectedProductForEdit.set(null);
    this.isProductModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.selectedProductForEdit.set(product);
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
    this.selectedProductForEdit.set(null);
  }

  handleProductSave(data: ProductFormData): void {
    const payload = {
      internalCode: data.internalCode.trim().toUpperCase(), 
      name: data.name.trim(),
      brand: data.brand.trim(),
      category: data.category,
      minStock: Number(data.minStock),
      priceTiers: [
        { tier: 1, price: Number(data.tier1Price) },
        { tier: 2, price: Number(data.tier2Price) },
        { tier: 3, price: Number(data.tier3Price) }
      ]
    };

    this.isSavingProduct.set(true);
    const editingProd = this.selectedProductForEdit();

    if (editingProd) {
      this.productsApi.update(editingProd.id, payload).subscribe({
        next: () => {
          this.isSavingProduct.set(false);
          this.toast.show(`Ficha técnica "${data.name}" actualizada con éxito.`, 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.toast.show(err?.error?.message || 'Error al actualizar ficha técnica.', 'error');
        }
      });
    } else {
      this.productsApi.create(payload).subscribe({
        next: () => {
          this.isSavingProduct.set(false);
          this.toast.show(`Repuesto "${data.name}" ingresado a la lista maestra.`, 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.toast.show(err?.error?.message || 'Error al registrar repuesto.', 'error');
        }
      });
    }
  }
}