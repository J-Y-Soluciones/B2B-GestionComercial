// src/app/features/catalog/components/stock-modal.component.ts
import { Component, HostListener, input, output } from '@angular/core';
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
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm font-bold border border-emerald-100">
              📦
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">Existencias por Mayorista</h3>
                <span class="font-mono text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                  {{ product()?.internalCode }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-mono truncate max-w-[280px] sm:max-w-none">
                {{ product()?.name }} &bull; {{ product()?.brand }}
              </p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
        </div>

        <!-- Tabla & Formulario -->
        <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <!-- Listado de Lotes -->
          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase">
                <tr>
                  <th class="py-2.5 px-3">Mayorista</th>
                  <th class="py-2.5 px-3 text-center">Costo Compra</th>
                  <th class="py-2.5 px-3 text-right">Existencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                @for (st of product()?.stocks; track st.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-800 font-sans text-xs">{{ st.supplierName || 'Mayorista' }}</div>
                      <div class="text-[10px] text-slate-400">SKU: {{ st.supplierSku || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center font-semibold text-slate-700">
                      S/ {{ st.costPrice | number:'1.2-2' }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-slate-900">
                      {{ st.stock }} un
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="py-8 text-center text-slate-400 text-xs font-sans">
                      Sin registros de inventario para este repuesto.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Ajuste Físico Rápido -->
          @if (canManage()) {
            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span class="text-[11px] font-bold text-slate-800 block">
                ➕ Entrada o Regularización de Stock
              </span>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-3">
                  <label class="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-0.5">Mayorista / Proveedor *</label>
                  <select [(ngModel)]="supplierId" (ngModelChange)="onSupplierChange($event)"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-700 cursor-pointer">
                    <option value="">Seleccione mayorista para registrar ingreso...</option>
                    @for (sup of suppliers(); track sup.id) {
                      <option [value]="sup.id">{{ sup.name }} (RUC: {{ sup.ruc }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-0.5">Stock Físico</label>
                  <input type="number" min="0" [(ngModel)]="stock"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:border-emerald-700" />
                </div>

                <div>
                  <label class="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-0.5">Costo Compra (S/)</label>
                  <input type="number" step="0.01" min="0" [(ngModel)]="costPrice"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:border-emerald-700" />
                </div>

                <div>
                  <label class="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-0.5">SKU Mayorista</label>
                  <input type="text" [(ngModel)]="sku" placeholder="Opcional"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-emerald-700" />
                </div>
              </div>

              <div class="flex justify-end pt-1">
                <button type="button" (click)="handleSubmit()" [disabled]="isSaving() || !supplierId"
                  class="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
                  <span>💾</span>
                  <span>{{ isSaving() ? 'Guardando...' : 'Registrar Existencias' }}</span>
                  <kbd class="hidden md:inline-block text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F9</kbd>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button type="button" (click)="close.emit()"
            class="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
            Cerrar
          </button>
        </div>
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

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F9' && !this.isSaving() && this.supplierId) {
      event.preventDefault();
      this.handleSubmit();
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