import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../../core/models/product.model';
import type { SupplierItem } from '../../../core/api/suppliers-api.service';

export interface UpdateStockEvent {
    supplierId: string;
    supplierSku: string | null;
    stock: number;
    costPrice: number;
}

@Component({
    selector: 'app-stock-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden space-y-4">
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <span class="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {{ product()?.internalCode }}
            </span>
            <h3 class="text-sm font-bold text-slate-900 mt-1">{{ product()?.name }}</h3>
            <p class="text-xs text-slate-500">Desglose de existencias y costos de reposición por mayorista.</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer">&times;</button>
        </div>

        <!-- Lista de existencias -->
        <div class="px-5 space-y-2.5 max-h-56 overflow-y-auto">
          @for (st of product()?.stocks; track st.id) {
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-slate-800">{{ st.supplierName || 'Proveedor' }}</div>
                <div class="text-[10px] text-slate-400 font-mono">
                  SKU Mayorista: {{ st.supplierSku || 'N/A' }} &bull; Costo Reposición: <strong class="text-slate-700">S/ {{ st.costPrice | number:'1.2-2' }}</strong>
                </div>
              </div>
              <div class="text-right">
                <span class="font-mono text-sm font-extrabold text-slate-900">{{ st.stock }} u.</span>
                <span class="block text-[9px] text-slate-400">en almacén</span>
              </div>
            </div>
          } @empty {
            <div class="py-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              Sin proveedores vinculados actualmente.
            </div>
          }
        </div>

        <!-- Formulario de actualización -->
        @if (canManage()) {
          <div class="p-5 border-t border-slate-100 bg-slate-50/40 space-y-3">
            <span class="text-xs font-bold text-slate-800 block">Actualizar Existencias con Proveedor</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              
              <!-- Select con detección de cambio -->
              <div class="sm:col-span-3">
                <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Mayorista</label>
                <select [(ngModel)]="supplierId" (ngModelChange)="onSupplierChange($event)"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-emerald-500">
                  <option value="">Seleccione un proveedor...</option>
                  @for (sup of suppliers(); track sup.id) {
                    <option [value]="sup.id">{{ sup.name }} (RUC: {{ sup.ruc }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Stock Físico</label>
                <input type="number" min="0" [(ngModel)]="stock"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Costo Unitario (S/)</label>
                <input type="number" step="0.01" min="0" [(ngModel)]="costPrice"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-500 uppercase mb-1">SKU Mayorista</label>
                <input type="text" [(ngModel)]="sku" placeholder="Opcional"
                  class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="close.emit()"
                class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
                Cerrar
              </button>
              <button type="button" (click)="handleSubmit()" [disabled]="isSaving()"
                class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50">
                {{ isSaving() ? 'Guardando...' : 'Guardar Existencias' }}
              </button>
            </div>
          </div>
        } @else {
          <div class="p-4 border-t border-slate-100 text-right">
            <button type="button" (click)="close.emit()"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
              Cerrar
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class StockModalComponent {
    product = input<Product | null>(null);
    suppliers = input<SupplierItem[]>([]);
    canManage = input<boolean>(false);
    isSaving = input<boolean>(false);

    close = output<void>();
    save = output<UpdateStockEvent>();

    supplierId = '';
    stock = 0;
    costPrice = 0;
    sku = '';

    onSupplierChange(selectedId: string): void {
        const currentStock = this.product()?.stocks?.find((s) => s.supplierId === selectedId);

        if (currentStock) {
            this.stock = currentStock.stock;
            this.costPrice = Number(currentStock.costPrice);
            this.sku = currentStock.supplierSku || '';
        } else {
            this.stock = 0;
            this.costPrice = 0;
            this.sku = '';
        }
    }

    handleSubmit(): void {
        this.save.emit({
            supplierId: this.supplierId,
            supplierSku: this.sku.trim() || null,
            stock: this.stock,
            costPrice: this.costPrice
        });
    }
}