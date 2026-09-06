import { Component, HostListener, input, output, effect } from '@angular/core';
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
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
              📋
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">
                  {{ isEditing() ? 'Ficha Técnica: ' + form.internalCode : 'Alta de Nuevo Repuesto' }}
                </h3>
                @if (isEditing()) {
                  <span class="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    {{ form.internalCode }}
                  </span>
                }
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Configuración comercial, OEM y márgenes protegidos.
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <!-- Datos Principales -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Código SKU Interno *</label>
                <input 
                  type="text" 
                  [ngModel]="form.internalCode" 
                  (ngModelChange)="form.internalCode = $event.toUpperCase()"
                  placeholder="Ej. DSC-001"
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none uppercase" />
              </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción Comercial del Repuesto *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Ej. Disco de Freno Ventilado Delantero"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Marca / Fabricante *</label>
              <input type="text" [(ngModel)]="form.brand" placeholder="Ej. Bosch, Brembo, NGK"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Línea / Categoría *</label>
              <select [(ngModel)]="form.category"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 outline-none">
                @for (cat of categories(); track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Matriz de Precios B2B & Márgenes Brutos -->
          <div class="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>💵</span> Matriz de Precios B2B & Márgenes Brutos
              </span>
              <span class="text-[10px] font-mono text-slate-500">Costo Base Ref: <strong>S/ 71.30</strong></span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <!-- Tier 1 -->
              <div class="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase block">Tier 1: Mostrador / Público</span>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-xs font-mono text-slate-400">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier1Price"
                    class="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-700" />
                </div>
                <span class="text-[9px] text-emerald-700 font-mono block">Margen estimado: +38%</span>
              </div>

              <!-- Tier 2 -->
              <div class="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase block">Tier 2: Taller / Mecánico Frecuente</span>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-xs font-mono text-slate-400">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier2Price"
                    class="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-700" />
                </div>
                <span class="text-[9px] text-emerald-700 font-mono block">Margen estimado: +26%</span>
              </div>

              <!-- Tier 3 (Mayorista / Flota) -->
              <div class="p-2.5 bg-amber-50/40 border border-amber-200 rounded-lg space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Tier 3: Flota / Mayorista</span>
                  <span class="text-[10px]">🔒</span>
                </div>
                <div class="relative">
                  <span class="absolute left-2.5 top-2 text-xs font-mono text-amber-600">S/</span>
                  <input type="number" step="0.01" min="0" [(ngModel)]="form.tier3Price"
                    class="w-full bg-white border border-amber-300 rounded-md pl-8 pr-2 py-1.5 text-xs font-mono font-bold text-amber-950 outline-none focus:border-amber-500" />
                </div>
                <span class="text-[9px] text-amber-800 font-mono block">Margen: +18% (Mínimo Permitido)</span>
              </div>
            </div>
          </div>

          <!-- Parámetros de Stock de Seguridad -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                Stock Mínimo de Seguridad (Alerta) *
              </label>
              <input type="number" min="1" [(ngModel)]="form.minStock"
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-emerald-700" />
            </div>

            <div>
              <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                Punto de Reorden Automático (Generar OC)
              </label>
              <input type="number" min="1" [value]="form.minStock * 2" readonly
                class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-500 outline-none cursor-not-allowed" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" (click)="close.emit()"
            class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
            Cancelar
          </button>
          <button type="button" (click)="submitForm()" [disabled]="isSaving()"
            class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5">
            <span>💾</span>
            <span>{{ isSaving() ? 'Guardando...' : 'Guardar Repuesto & Actualizar Tiers' }}</span>
            <kbd class="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F8</kbd>
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
    tier3Price: 0,
  };

  constructor() {
    effect(() => {
      const prod = this.product();
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
        };
      } else {
        this.form = {
          internalCode: '',
          name: '',
          brand: '',
          category: this.categories()[0] || 'Frenos',
          minStock: 5,
          tier1Price: 0,
          tier2Price: 0,
          tier3Price: 0,
        };
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F8') {
      event.preventDefault();
      event.stopPropagation();
      if (!this.isSaving()) {
        this.submitForm();
      }
    }
  }

  isEditing(): boolean {
    return Boolean(this.product());
  }

  submitForm(): void {
    this.form.internalCode = this.form.internalCode.trim().toUpperCase();
    this.save.emit(this.form);
  }
}