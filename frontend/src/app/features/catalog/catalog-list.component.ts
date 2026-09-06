import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
    <div class="space-y-6">
      <!-- ENCABEZADO ESTANDARIZADO -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            COMERCIAL &bull; INVENTARIO &bull; LISTA MAESTRA
          </div>
          <div class="flex items-center gap-2.5 mt-0.5">
            <h1 class="text-base font-bold text-slate-900">Catálogo General e Inventario Multi-Proveedor</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Sincronizado
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Supervisión de repuestos codificados, matriz de precios (Tier 1-3) y stock por distribuidor.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" (click)="loadProducts()"
            class="text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer font-medium">
            <span>🔄</span> Actualizar
          </button>
          @if (canManageStock()) {
            <button type="button" (click)="openCreateModal()"
              class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>+ Nuevo Repuesto</span>
            </button>
          }
        </div>
      </div>

      <!-- KPIS OPERATIVOS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Catálogo Activo</span>
            <span class="text-xl font-black text-slate-900 font-mono mt-0.5 block">{{ products().length }} SKUs</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Repuestos codificados</span>
          </div>
          <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold">
            📦
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Stock Total Físico</span>
            <span class="text-xl font-black text-slate-900 font-mono mt-0.5 block">{{ totalUnitsStock() }} u.</span>
            <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">Existencias consolidadas</span>
          </div>
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
            📊
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">Bajo Stock Mínimo</span>
            <span class="text-xl font-black text-amber-800 font-mono mt-0.5 block">{{ lowStockCount() }} SKUs</span>
            <span class="text-[10px] text-amber-600 font-mono mt-0.5 block">Requieren reposición urgente</span>
          </div>
          <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold">
            ⚠️
          </div>
        </div>
      </div>

      <!-- FILTROS Y BÚSQUEDA -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          @for (cat of categories; track cat) {
            <button type="button" (click)="setCategory(cat)"
              [class]="selectedCategory() === cat ? 'bg-emerald-800 text-white font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-3 py-1 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors">
              {{ cat }}
            </button>
          }
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div class="relative w-full sm:w-96">
            <input type="text" [ngModel]="searchQuery()" (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por SKU, Nombre o Marca (ej. Bosch, Filtro)..."
              class="w-full text-xs border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"></path>
            </svg>
          </div>
          <span class="text-xs text-slate-500 font-mono">
            {{ isLoading() ? 'Sincronizando...' : filteredProducts().length + ' repuestos listados' }}
          </span>
        </div>
      </div>

      <!-- TABLA DE CATÁLOGO -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <th class="py-3 px-4">SKU / Repuesto</th>
                <th class="py-3 px-4">Categoría & Marca</th>
                <th class="py-3 px-4 text-center">Escala de Precios (PEN)</th>
                <th class="py-3 px-4 text-center">Existencias</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (filteredProducts().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="5" class="py-10 text-center text-slate-400 text-xs">
                    No se encontraron repuestos con los criterios ingresados.
                  </td>
                </tr>
              }

              @for (prod of filteredProducts(); track prod.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-mono font-bold text-slate-800 text-xs">{{ prod.internalCode }}</div>
                    <div class="font-semibold text-slate-900 mt-0.5">{{ prod.name }}</div>
                  </td>

                  <td class="py-3 px-4 text-slate-600">
                    <span class="inline-block bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-medium">
                      {{ prod.category }}
                    </span>
                    <div class="text-[11px] text-slate-500 mt-0.5 font-medium">{{ prod.brand }}</div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1.5 font-mono text-[11px]">
                      <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        T1: <strong>S/ {{ getTierPrice(prod, 1) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        T2: <strong>S/ {{ getTierPrice(prod, 2) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-900 font-bold">
                        T3: <strong>S/ {{ getTierPrice(prod, 3) | number:'1.2-2' }}</strong>
                      </span>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <span [class]="prod.totalStock > prod.minStock 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border">
                        <span class="w-1.5 h-1.5 rounded-full" [class]="prod.totalStock > prod.minStock ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                        {{ prod.totalStock }} u.
                      </span>
                      <span class="text-[10px] text-slate-400 font-mono">Mínimo: {{ prod.minStock }} u.</span>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <button type="button" (click)="openStockModal(prod)"
                        class="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer p-1 rounded hover:bg-emerald-50 transition-colors">
                        Stock ({{ prod.stocks ? prod.stocks.length : 0 }})
                      </button>
                      @if (canManageStock()) {
                        <button type="button" (click)="openEditModal(prod)"
                          class="text-slate-500 hover:text-slate-800 font-medium text-xs cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors">
                          ✏️ Editar
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

      <!-- MODAL DE STOCK POR MAYORISTA -->
      @if (selectedProductForStock()) {
        <app-stock-modal
          [product]="selectedProductForStock()"
          [suppliers]="suppliers()"
          [canManage]="canManageStock()"
          [isSaving]="isSavingStock()"
          (close)="closeStockModal()"
          (save)="handleStockUpdate($event)" />
      }

      <!-- MODAL DE CREACIÓN / EDICIÓN DE REPUESTOS -->
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
  selectedCategory = signal('Todas');
  categories = ['Todas', 'Frenos', 'Suspensión & Dirección', 'Motor & Culata', 'Filtros & Lubricantes', 'Transmisión 4x4'];
  formCategories = ['Frenos', 'Suspensión & Dirección', 'Motor & Culata', 'Filtros & Lubricantes', 'Transmisión 4x4'];

  // Modal de stock
  selectedProductForStock = signal<Product | null>(null);

  // Modal de producto (Crear / Editar)
  selectedProductForEdit = signal<Product | null>(null);
  isProductModalOpen = signal(false);

  canManageStock = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'WAREHOUSE';
  });

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.products().filter((p) => {
      const matchCat = cat === 'Todas' || p.category === cat;
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

  // Métodos Modal Stock
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
      this.toast.show('Seleccione un mayorista/proveedor.', 'error');
      return;
    }

    if (event.stock < 0) {
      this.toast.show('El stock no puede ser negativo.', 'error');
      return;
    }

    this.isSavingStock.set(true);

    this.productsApi.setSupplierStock(prod.id, event).subscribe({
      next: () => {
        this.isSavingStock.set(false);
        this.toast.show(`Existencias actualizadas para "${prod.name}".`, 'success');
        this.closeStockModal();
        this.loadProducts();
      },
      error: (err) => {
        this.isSavingStock.set(false);
        this.toast.show(err?.error?.message || 'Error al actualizar existencias.', 'error');
      }
    });
  }

  // Métodos Modal Producto (Crear / Editar)
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
    if (!data.internalCode?.trim() || !data.name?.trim()) {
      this.toast.show('Código interno y nombre son obligatorios.', 'error');
      return;
    }

    const payload = {
      internalCode: data.internalCode.trim(),
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
          this.toast.show(`Repuesto "${data.name}" actualizado.`, 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.toast.show(err?.error?.message || 'Error al actualizar.', 'error');
        }
      });
    } else {
      this.productsApi.create(payload).subscribe({
        next: () => {
          this.isSavingProduct.set(false);
          this.toast.show(`Repuesto "${data.name}" registrado exitosamente.`, 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.toast.show(err?.error?.message || 'Error al registrar.', 'error');
        }
      });
    }
  }
}