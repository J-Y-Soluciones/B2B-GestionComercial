import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CheckoutTableItem {
  productId: string;
  code: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  priceTier: number;
  subtotal: number;
  supplierId: string;
  availableSuppliers: { id: string; name: string; stock: number }[];
}

@Component({
  selector: 'app-checkout-items-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Detalle de Repuestos & Descarga de Stock</h3>
          <p class="text-[11px] text-slate-500">Almacén Central - Descuento físico inmediato</p>
        </div>
        <span class="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
          {{ items().length }} items listos
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th class="px-4 py-3">SKU / Descripción & Marca</th>
              <th class="px-4 py-3 text-center">Cant.</th>
              <th class="px-4 py-3 text-center">Tarifa</th>
              <th class="px-4 py-3">Lote / Proveedor de Origen</th>
              <th class="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of items(); track item.productId) {
              @let currentStock = getSelectedSupplierStock(item);
              @let hasDeficit = currentStock < item.quantity;

              <tr [class.bg-rose-50/60]="hasDeficit" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3">
                  <span class="font-mono text-xs font-bold text-slate-900 block">{{ item.code }}</span>
                  <span class="text-slate-700 font-medium">{{ item.name }}</span>
                  <span class="text-[11px] text-slate-400 block">{{ item.brand }}</span>
                </td>
                
                <td class="px-4 py-3 text-center font-bold text-slate-800 text-sm">
                  {{ item.quantity }} <span class="text-xs font-normal text-slate-500">und</span>
                </td>
                
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                        [ngClass]="item.priceTier === 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'">
                    T{{ item.priceTier }} (S/ {{ item.unitPrice | number:'1.2-2' }})
                  </span>
                </td>
                
                <td class="px-4 py-3">
                  @if (item.availableSuppliers.length > 0) {
                    <div class="space-y-1">
                      <select [ngModel]="item.supplierId"
                              (ngModelChange)="supplierChanged.emit({ productId: item.productId, supplierId: $event })"
                              [ngClass]="hasDeficit ? 'border-rose-400 bg-rose-50 text-rose-800 focus:ring-rose-500' : 'border-slate-300 bg-white focus:ring-emerald-600'"
                              class="w-full text-xs py-1.5 px-2 border rounded-lg outline-none font-medium transition-colors">
                        @for (sup of item.availableSuppliers; track sup.id) {
                          <option [value]="sup.id">
                            {{ sup.name }} ({{ sup.stock }} disponibles)
                          </option>
                        }
                      </select>

                      @if (hasDeficit) {
                        <p class="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                          <span>⚠ Stock insuficiente:</span>
                          <span>Requiere {{ item.quantity }}, lote solo tiene {{ currentStock }}.</span>
                        </p>
                      }
                    </div>
                  } @else {
                    <span class="text-rose-500 text-[11px] italic font-semibold">Sin stock en almacén</span>
                  }
                </td>
                
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                  S/ {{ item.subtotal | number:'1.2-2' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CheckoutItemsTableComponent {
  items = input.required<CheckoutTableItem[]>();
  supplierChanged = output<{ productId: string; supplierId: string }>();

  getSelectedSupplierStock(item: CheckoutTableItem): number {
    const sup = item.availableSuppliers.find((s) => s.id === item.supplierId);
    return sup ? sup.stock : 0;
  }
}