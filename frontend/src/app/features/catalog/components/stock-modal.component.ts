//src/app/features/catalog/components/stock-modal.component.ts
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
   <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
  <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
    <!-- Header -->
    <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
          📦
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-900">Lotes & Existencias por Proveedor</h3>
            <span class="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
              {{ product()?.internalCode }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ product()?.name }} &bull; Marca: {{ product()?.brand }}
          </p>
        </div>
      </div>
      <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer leading-none">&times;</button>
    </div>

        <!-- Tabla de Distribución por Almacenes y Proveedores -->
        <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Distribución por Sucursales y Red Mayorista</span>
            <span class="text-[10px] font-mono text-emerald-700">✓ Sincronizado en tiempo real</span>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th class="py-2.5 px-3">Ubicación / Mayorista</th>
                  <th class="py-2.5 px-3 text-center">Disponibilidad</th>
                  <th class="py-2.5 px-3 text-center">Costo Reposición</th>
                  <th class="py-2.5 px-3 text-right">Existencia Física</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-sans">
                @for (st of product()?.stocks; track st.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-800">{{ st.supplierName || 'Mayorista' }}</div>
                      <div class="text-[10px] text-slate-400 font-mono">SKU Ref: {{ st.supplierSku || 'N/A' }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Físico Verificado
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                      S/ {{ st.costPrice | number:'1.2-2' }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {{ st.stock }} un
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="py-6 text-center text-slate-400 text-xs">
                      Sin registros de inventario para este repuesto.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Formulario: Ajuste / Ingreso Rápido de Stock Físico -->
          @if (canManage()) {
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4">
              <span class="text-xs font-bold text-slate-800 block">
                ➕ Ajuste / Ingreso Rápido de Stock Físico
              </span>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <!-- Mayorista -->
                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Mayorista / Proveedor</label>
                  <select [(ngModel)]="supplierId" (ngModelChange)="onSupplierChange($event)"
                    class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-emerald-700">
                    <option value="">Seleccione un mayorista para ingresar existencias...</option>
                    @for (sup of suppliers(); track sup.id) {
                      <option [value]="sup.id">{{ sup.name }} (RUC: {{ sup.ruc }})</option>
                    }
                  </select>
                </div>

                <!-- Stock Físico -->
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Físico Real</label>
                  <input type="number" min="0" [(ngModel)]="stock"
                    class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-700" />
                </div>

                <!-- Costo Unitario -->
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Costo Reposición (S/)</label>
                  <input type="number" step="0.01" min="0" [(ngModel)]="costPrice"
                    class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-700" />
                </div>

                <!-- SKU Mayorista -->
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">SKU Mayorista (OEM)</label>
                  <input type="text" [(ngModel)]="sku" placeholder="Opcional"
                    class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-700" />
                </div>
              </div>

              <div class="flex justify-end pt-1">
                <button type="button" (click)="handleSubmit()" [disabled]="isSaving() || !supplierId"
                  class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5">
                  <span>💾</span>
                  <span>{{ isSaving() ? 'Registrando...' : 'Registrar Movimiento en Kardex' }}</span>
                  <kbd class="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded">F9</kbd>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Footer fijo -->
        <div class="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs shrink-0">
          <span class="text-[11px] text-slate-400 font-mono">Auditoría: Registro trazable con Hash de transacción</span>
          <button type="button" (click)="close.emit()"
            class="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
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
    if (event.key === 'F9') {
      event.preventDefault();
      event.stopPropagation();
      if (!this.isSaving() && this.supplierId) {
        this.handleSubmit();
      }
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