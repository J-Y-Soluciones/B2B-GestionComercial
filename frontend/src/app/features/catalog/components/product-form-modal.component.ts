//src/app/features/catalog/components/product-form-modal.component.ts
import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../../core/models/product.model';

export interface ProductFormData {
    internalCode: string;
    name: string;
    brand: string;
    category: string;
    minStock: number;
    tier1Price: number;
    tier2Price: number;
    tier3Price: number;
}

@Component({
    selector: 'app-product-form-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
        
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              {{ isEditing() ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto' }}
            </h3>
            <p class="text-xs text-slate-500">Defina datos generales y escala de precios base.</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer">&times;</button>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <!-- SKU y Marca -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">SKU / Código Interno</label>
              <input type="text" [(ngModel)]="form.internalCode" placeholder="Ej. BOSCH-PF-01"
                class="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Marca</label>
              <input type="text" [(ngModel)]="form.brand" placeholder="Ej. Bosch, NGK, Fram"
                class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-500" />
            </div>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Descripción / Nombre</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Ej. Pastillas de Freno Delanteras"
              class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-500" />
          </div>

          <!-- Categoría y Stock Mínimo -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Categoría</label>
              <select [(ngModel)]="form.category" class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-500">
                @for (c of categories(); track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Stock Mínimo (Alerta)</label>
              <input type="number" min="1" [(ngModel)]="form.minStock"
                class="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono outline-none focus:border-emerald-500" />
            </div>
          </div>

          <!-- Escala de Precios Tier 1, 2 y 3 -->
          <div class="pt-2 border-t border-slate-100">
            <span class="block text-[11px] font-bold text-slate-800 mb-2">Escala Oficial de Precios (S/ PEN)</span>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[10px] font-medium text-slate-500 mb-1">Tier 1 (Mostrador)</label>
                <input type="number" step="0.10" min="0" [(ngModel)]="form.tier1Price"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono outline-none focus:border-emerald-500 font-bold" />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-slate-500 mb-1">Tier 2 (Taller)</label>
                <input type="number" step="0.10" min="0" [(ngModel)]="form.tier2Price"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-amber-700 mb-1">Tier 3 (Especial)</label>
                <input type="number" step="0.10" min="0" [(ngModel)]="form.tier3Price"
                  class="w-full bg-amber-50/50 border border-amber-300 rounded-lg p-2 font-mono outline-none focus:border-amber-500 font-bold text-amber-900" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" (click)="close.emit()"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
            Cancelar
          </button>
          <button type="button" (click)="submitForm()" [disabled]="isSaving()"
            class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50">
            {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar Repuesto' : 'Crear Repuesto') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductFormModalComponent {
    product = input<Product | null>(null);
    categories = input<string[]>([]);
    isSaving = input<boolean>(false);

    close = output<void>();
    save = output<ProductFormData>();

    form: ProductFormData = {
        internalCode: '',
        name: '',
        brand: '',
        category: 'Frenos',
        minStock: 5,
        tier1Price: 0,
        tier2Price: 0,
        tier3Price: 0
    };

    constructor() {
        effect(() => {
            const p = this.product();
            if (p) {
                const t1 = p.priceTiers?.find((t) => t.tier === 1)?.price ?? 0;
                const t2 = p.priceTiers?.find((t) => t.tier === 2)?.price ?? 0;
                const t3 = p.priceTiers?.find((t) => t.tier === 3)?.price ?? 0;

                this.form = {
                    internalCode: p.internalCode || '',
                    name: p.name || '',
                    brand: p.brand || '',
                    category: p.category || (this.categories()[0] ?? 'Frenos'),
                    minStock: p.minStock || 5,
                    tier1Price: Number(t1),
                    tier2Price: Number(t2),
                    tier3Price: Number(t3)
                };
            } else {
                // Modo creación: resetear campos limpios
                this.form = {
                    internalCode: '',
                    name: '',
                    brand: '',
                    category: this.categories()[0] ?? 'Frenos',
                    minStock: 5,
                    tier1Price: 0,
                    tier2Price: 0,
                    tier3Price: 0
                };
            }
        });
    }

    isEditing(): boolean {
        return Boolean(this.product());
    }

    submitForm(): void {
        this.save.emit(this.form);
    }
}