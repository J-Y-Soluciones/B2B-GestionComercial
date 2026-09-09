// src/app/features/catalog/components/product-form-modal.component.ts
import {
  Component,
  HostListener,
  input,
  output,
  effect,
  computed,
  inject,
  signal,
  ChangeDetectorRef,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../../core/models/product.model';
import type { SupplierItem } from '../../../core/api/suppliers-api.service';
import { StorageService } from '../../../core/services/storage.service';

export interface ProductFormData {
  internalCode: string;
  name: string;
  brand: string;
  category: string;
  minStock: number;
  tier1Price: number;
  tier2Price: number;
  tier3Price: number;
  imageUrl?: string;
  initialSupplierId?: string;
  initialStock?: number;
  initialCostPrice?: number;
  initialSku?: string;
}

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header Fijo -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm font-bold border border-emerald-100">
              📋
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">
                  {{ isEditing() ? 'Ficha Técnica: ' + form.internalCode : 'Nuevo Repuesto' }}
                </h3>
                @if (isEditing()) {
                  <span class="font-mono text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    {{ form.internalCode }}
                  </span>
                }
              </div>
              <p class="text-[10px] text-slate-400 font-mono">
                Catálogo general, escala de precios B2B y lotes de almacén
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Body Scrolleable -->
        <div class="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          <!-- Imagen & SKU Principal -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div class="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
              @if (isUploadingImage()) {
                <span class="text-xs font-mono text-emerald-700 animate-pulse">⏳...</span>
              } @else if (form.imageUrl) {
                <img [src]="form.imageUrl" alt="Preview" class="w-full h-full object-cover" />
                <button type="button" (click)="form.imageUrl = ''" 
                  class="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center cursor-pointer">
                  &times;
                </button>
              } @else {
                <span class="text-xl text-slate-300">📷</span>
              }
            </div>

            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between">
                <label class="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">Fotografía del Repuesto</label>
                <span class="text-[9px] font-mono text-slate-400">JPG, PNG o WebP (Máx. 2MB)</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="text" [(ngModel)]="form.imageUrl" [disabled]="isUploadingImage()" placeholder="Pegar URL de imagen o subir archivo..."
                  class="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-700 font-mono disabled:bg-slate-100 disabled:text-slate-400" />
                
                <label [class.opacity-50]="isUploadingImage()" [class.cursor-not-allowed]="isUploadingImage()" 
                  class="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg cursor-pointer shadow-2xs shrink-0 flex items-center gap-1 transition-all">
                  <span>{{ isUploadingImage() ? '⏳ Subiendo...' : '📁 Subir' }}</span>
                  <input type="file" accept="image/*" (change)="onFileSelected($event)" [disabled]="isUploadingImage()" class="hidden" />
                </label>
              </div>
            </div>
          </div>

          <!-- Campos Descriptivos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Código SKU Interno *</label>
              <input type="text" [ngModel]="form.internalCode" (ngModelChange)="form.internalCode = $event.toUpperCase()"
                placeholder="Ej. DSC-001"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción Comercial *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Disco de Freno Ventilado Delantero"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Marca / Fabricante *</label>
              <input type="text" [(ngModel)]="form.brand" placeholder="Ej. Bosch, Brembo, Denso"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Línea / Categoría *</label>
              <select [(ngModel)]="form.category"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-700 outline-none cursor-pointer">
                @for (cat of categories(); track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Lote Inicial (Solo en Creación) -->
          @if (!isEditing()) {
            <div class="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>📦</span> Stock Inicial & Proveedor (Opcional)
                </span>
                <span class="text-[9px] font-mono text-emerald-700">Alta atómica de inventario</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-3">
                  <select [(ngModel)]="initialSupplierId"
                    class="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-700 cursor-pointer">
                    <option value="">(Sin existencias iniciales por ahora)</option>
                    @for (sup of suppliers(); track sup.id) {
                      <option [value]="sup.id">{{ sup.name }} (RUC: {{ sup.ruc }})</option>
                    }
                  </select>
                </div>

                @if (initialSupplierId) {
                  <div>
                    <label class="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">Stock Físico</label>
                    <input type="number" min="1" [(ngModel)]="initialStock"
                      class="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label class="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">Costo Unitario (S/)</label>
                    <input type="number" step="0.01" min="0" [(ngModel)]="initialCostPrice"
                      class="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label class="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">SKU Proveedor</label>
                    <input type="text" [(ngModel)]="initialSku" placeholder="Opcional"
                      class="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 outline-none" />
                  </div>
                }
              </div>
            </div>
          }

          <!-- Matriz de Precios B2B -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-800">💵 Matriz de Precios B2B</span>
              <span class="text-[10px] font-mono text-slate-500">
                Ref. Costo: <strong class="text-slate-800">S/ {{ referenceCost() | number:'1.2-2' }}</strong>
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <!-- Tier 1 -->
              <div class="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase block">Tier 1: Mostrador</span>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-slate-400">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier1Price"
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-700" />
                </div>
                <span class="text-[9px] block" [ngClass]="calcMargin(form.tier1Price) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                  Margen: {{ calcMargin(form.tier1Price) | number:'1.1-1' }}%
                </span>
              </div>

              <!-- Tier 2 -->
              <div class="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase block">Tier 2: Taller</span>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-slate-400">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier2Price"
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-700" />
                </div>
                <span class="text-[9px] block" [ngClass]="calcMargin(form.tier2Price) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                  Margen: {{ calcMargin(form.tier2Price) | number:'1.1-1' }}%
                </span>
              </div>

              <!-- Tier 3 -->
              <div class="p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-bold text-amber-900 uppercase">Tier 3: Flota</span>
                  <span class="text-[10px]">🔒</span>
                </div>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-amber-600">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier3Price"
                    class="w-full bg-white border border-amber-300 rounded-lg pl-7 pr-2 py-1.5 text-xs font-bold text-amber-950 outline-none focus:border-amber-600" />
                </div>
                <span class="text-[9px] block" [ngClass]="calcMargin(form.tier3Price) >= 15 ? 'text-amber-800' : 'text-rose-600 font-bold'">
                  Margen: {{ calcMargin(form.tier3Price) | number:'1.1-1' }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Stock Mínimo -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                Stock Mínimo de Alerta *
              </label>
              <input type="number" min="1" [(ngModel)]="form.minStock"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-emerald-700" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Punto de Reorden (OC)
              </label>
              <input type="number" [value]="form.minStock * 2" readonly
                class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 outline-none cursor-not-allowed" />
            </div>
          </div>
        </div>

        <!-- Footer Fijo -->
        <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
          <button type="button" (click)="close.emit()"
            class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
            Cancelar
          </button>
          <button type="button" (click)="submitForm()" [disabled]="isSaving()"
            class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            <span>💾</span>
            <span>{{ isSaving() ? 'Guardando...' : (isEditing() ? 'Guardar Cambios' : 'Registrar Repuesto') }}</span>
            <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F8</kbd>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductFormModalComponent {
  private readonly storageService = inject(StorageService);
  private readonly cdr = inject(ChangeDetectorRef);

  isUploadingImage = signal(false);

  product = input<Product | null>(null);
  categories = input<string[]>([]);
  suppliers = input<SupplierItem[]>([]);
  isSaving = input<boolean>(false);

  close = output<void>();
  save = output<ProductFormData>();

  initialSupplierId = '';
  initialStock = 10;
  initialCostPrice = 0;
  initialSku = '';

  private lastLoadedKey: string | null = '__init__';

  form: ProductFormData = {
    internalCode: '',
    name: '',
    brand: '',
    category: 'Frenos',
    minStock: 5,
    tier1Price: 0,
    tier2Price: 0,
    tier3Price: 0,
    imageUrl: '',
  };

  referenceCost = computed(() => {
    if (!this.isEditing() && this.initialCostPrice > 0) return this.initialCostPrice;
    const prod = this.product();
    if (prod?.stocks && prod.stocks.length > 0) return Number(prod.stocks[0].costPrice || 0);
    return 0;
  });

  calcMargin(price: number): number {
    const cost = this.referenceCost();
    if (!cost || !price || cost <= 0) return 0;
    return Number((((price - cost) / cost) * 100).toFixed(1));
  }

  constructor() {
    effect(() => {
      const prod = this.product();
      const currentKey = prod ? prod.id : 'new';

      // Evitar que el effect se registre dependiente de isUploadingImage
      const uploading = untracked(() => this.isUploadingImage());
      if (uploading) return;

      // Solo reinicializar el formulario si cambió el producto objetivo
      if (this.lastLoadedKey === currentKey) return;
      this.lastLoadedKey = currentKey;

      if (prod) {
        const getP = (num: number) => {
          const t = prod.priceTiers?.find((item) => item.tier === num);
          return t ? Number(t.price) : 0;
        };

        this.form = {
          internalCode: prod.internalCode,
          name: prod.name,
          brand: prod.brand,
          category: prod.category,
          minStock: prod.minStock,
          tier1Price: getP(1),
          tier2Price: getP(2),
          tier3Price: getP(3),
          imageUrl: prod.imageUrl || '',
        };
      } else {
        this.form = {
          internalCode: '',
          name: '',
          brand: '',
          category: untracked(() => this.categories()[0]) || 'Frenos',
          minStock: 5,
          tier1Price: 0,
          tier2Price: 0,
          tier3Price: 0,
          imageUrl: '',
        };
        this.initialSupplierId = '';
        this.initialStock = 10;
        this.initialCostPrice = 0;
        this.initialSku = '';
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F8' && !this.isSaving()) {
      event.preventDefault();
      this.submitForm();
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen seleccionada supera el límite máximo de 2 MB.');
      input.value = '';
      return;
    }

    try {
      this.isUploadingImage.set(true);

      const publicUrl = await this.storageService.uploadProductImage(
        file,
        this.form.internalCode || 'repuesto'
      );

      this.form = {
        ...this.form,
        imageUrl: publicUrl
      };
      this.cdr.detectChanges();
    } catch (err: any) {
      alert(err?.message || 'Error al subir la imagen a la nube.');
    } finally {
      this.isUploadingImage.set(false);
      input.value = '';
      this.cdr.detectChanges();
    }
  }

  isEditing(): boolean {
    return Boolean(this.product());
  }

  submitForm(): void {
    this.form.internalCode = this.form.internalCode.trim().toUpperCase();
    if (!this.isEditing() && this.initialSupplierId) {
      this.form.initialSupplierId = this.initialSupplierId;
      this.form.initialStock = Number(this.initialStock) || 0;
      this.form.initialCostPrice = Number(this.initialCostPrice) || 0;
      this.form.initialSku = this.initialSku.trim() || undefined;
    }
    this.save.emit({ ...this.form, imageUrl: this.form.imageUrl?.trim() || undefined });
  }
}