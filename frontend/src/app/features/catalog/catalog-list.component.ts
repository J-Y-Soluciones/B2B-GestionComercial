//src/app/features/catalog/catalog-list.component.ts
import { Component, OnInit, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsApiService } from '../../core/api/products-api.service';
import { SuppliersApiService, type SupplierItem } from '../../core/api/suppliers-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CatalogHeaderComponent } from './components/catalog-header.component';
import { CatalogKpisComponent } from './components/catalog-kpis.component';
import { CatalogFiltersComponent, type CategoryLine } from './components/catalog-filters.component';
import { CatalogTableComponent } from './components/catalog-table.component';
import { StockModalComponent, type UpdateStockEvent } from './components/stock-modal.component';
import { ProductFormModalComponent, type ProductFormData } from './components/product-form-modal.component';
import type { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    CatalogHeaderComponent,
    CatalogKpisComponent,
    CatalogFiltersComponent,
    CatalogTableComponent,
    StockModalComponent,
    ProductFormModalComponent
  ],
  template: `
    <div class="space-y-5">
      <app-catalog-header 
        [canManage]="canManageStock()" 
        (refresh)="loadProducts()" 
        (create)="openCreateModal()" />

      <app-catalog-kpis 
        [totalProducts]="products().length" 
        [totalUnits]="totalUnitsStock()" 
        [suppliersCount]="suppliers().length" 
        [lowStockCount]="lowStockCount()" />

      <app-catalog-filters 
        [categories]="categoryLines()" 
        [selectedCategory]="selectedCategory()" 
        [searchQuery]="searchQuery()" 
        [totalFiltered]="filteredProducts().length" 
        (categoryChange)="selectedCategory.set($event)" 
        (searchChange)="searchQuery.set($event)" />

      <app-catalog-table 
        [products]="filteredProducts()" 
        [isLoading]="isLoading()" 
        [canManage]="canManageStock()" 
        (openStock)="selectedProductForStock.set($event)" 
        (openEdit)="openEditModal($event)" />

      @if (selectedProductForStock()) {
        <app-stock-modal
          [product]="selectedProductForStock()"
          [suppliers]="suppliers()"
          [canManage]="canManageStock()"
          [isSaving]="isSavingStock()"
          (close)="selectedProductForStock.set(null)"
          (save)="handleStockUpdate($event)" />
      }
      @if (isProductModalOpen()) {
        <app-product-form-modal
          [product]="selectedProductForEdit()"
          [categories]="formCategories"
          [suppliers]="suppliers()"
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

  categoryLines = computed<CategoryLine[]>(() => {
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

  totalUnitsStock = computed(() => this.products().reduce((acc, p) => acc + (p.totalStock || 0), 0));
  lowStockCount = computed(() => this.products().filter((p) => (p.totalStock || 0) <= (p.minStock || 5)).length);

  @HostListener('window:keydown', ['$event'])
  handleShortcuts(event: KeyboardEvent): void {
    if (event.key === 'F4') {
      event.preventDefault();
      if (this.canManageStock()) this.openCreateModal();
    } else if (event.key === 'F5') {
      event.preventDefault();
      this.loadProducts();
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSuppliers();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productsApi.search({ limit: 100 }).subscribe({
      next: (res) => { this.products.set(res); this.isLoading.set(false); },
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

  handleStockUpdate(event: UpdateStockEvent): void {
    const prod = this.selectedProductForStock();
    if (!prod || !event.supplierId) return;

    this.isSavingStock.set(true);
    this.productsApi.setSupplierStock(prod.id, event).subscribe({
      next: () => {
        this.isSavingStock.set(false);
        this.toast.show(`Existencias actualizadas para "${prod.name}".`, 'success');
        this.selectedProductForStock.set(null);
        this.loadProducts();
      },
      error: (err) => {
        this.isSavingStock.set(false);
        this.toast.show(err?.error?.message || 'Error al actualizar existencias.', 'error');
      }
    });
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
    const editing = this.selectedProductForEdit();
    const request$ = editing ? this.productsApi.update(editing.id, payload) : this.productsApi.create(payload);

    request$.subscribe({
      next: (createdOrUpdatedProduct: Product) => {
        // Si es creación y el usuario configuró existencias iniciales en el mismo formulario
        if (!editing && data.initialSupplierId && createdOrUpdatedProduct?.id) {
          this.productsApi.setSupplierStock(createdOrUpdatedProduct.id, {
            supplierId: data.initialSupplierId,
            supplierSku: data.initialSku || null,
            stock: data.initialStock || 0,
            costPrice: data.initialCostPrice || 0
          }).subscribe({
            next: () => {
              this.isSavingProduct.set(false);
              this.toast.show(`Repuesto y stock inicial registrados con éxito.`, 'success');
              this.closeProductModal();
              this.loadProducts();
            },
            error: () => {
              this.isSavingProduct.set(false);
              this.toast.show(`Repuesto creado, pero falló el stock inicial. Edítalo en Lotes.`, 'info');
              this.closeProductModal();
              this.loadProducts();
            }
          });
        } else {
          this.isSavingProduct.set(false);
          this.toast.show(`Repuesto guardado con éxito.`, 'success');
          this.closeProductModal();
          this.loadProducts();
        }
      },
      error: (err) => {
        this.isSavingProduct.set(false);
        this.toast.show(err?.error?.message || 'Error al guardar repuesto.', 'error');
      }
    });
  }
}