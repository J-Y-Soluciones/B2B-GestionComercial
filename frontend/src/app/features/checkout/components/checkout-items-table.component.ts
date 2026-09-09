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
    <div class="space-y-3">
      <!-- MÓVIL (< md): Cards compactas por ítem sin scroll lateral -->
      <div class="block md:hidden space-y-2.5">
        <div class="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <span>Repuestos a Despachar ({{ items().length }})</span>
          <span class="text-[10px] font-mono text-emerald-700">Descarga inmediata</span>
        </div>

        @for (item of items(); track item.productId) {
          @let currentStock = getSelectedSupplierStock(item);
          @let hasDeficit = currentStock < item.quantity;

          <div class="bg-white p-3.5 rounded-xl border shadow-2xs space-y-2.5"
            [ngClass]="hasDeficit ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'">
            
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <span class="font-mono text-[10px] font-bold text-slate-500 uppercase">{{ item.code }}</span>
                <h4 class="text-xs font-bold text-slate-900 truncate leading-snug">{{ item.name }}</h4>
                <div class="text-[10px] text-slate-400">{{ item.brand }}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0"
                [ngClass]="item.priceTier === 3 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                T{{ item.priceTier }} &bull; S/ {{ item.unitPrice | number:'1.2-2' }}
              </span>
            </div>

            <!-- Selector de Lote / Proveedor en Móvil -->
            <div class="space-y-1">
              <label class="text-[9px] font-mono font-bold uppercase text-slate-400 block">Lote / Proveedor de Salida:</label>
              @if (item.availableSuppliers.length > 0) {
                <select [ngModel]="item.supplierId"
                  (ngModelChange)="supplierChanged.emit({ productId: item.productId, supplierId: $event })"
                  [ngClass]="hasDeficit ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-slate-50 text-slate-800'"
                  class="w-full text-xs py-1.5 px-2 border rounded-lg outline-none font-medium">
                  @for (sup of item.availableSuppliers; track sup.id) {
                    <option [value]="sup.id">
                      {{ sup.name }} ({{ sup.stock }} disp.)
                    </option>
                  }
                </select>

                @if (hasDeficit) {
                  <p class="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                    <span>⚠ Requiere {{ item.quantity }}, lote solo cuenta con {{ currentStock }}.</span>
                  </p>
                }
              } @else {
                <span class="text-rose-600 text-[11px] italic font-semibold">Sin existencias en almacén</span>
              }
            </div>

            <!-- Cantidad y Subtotal -->
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span class="font-mono text-slate-600">Cant: <strong>{{ item.quantity }} un</strong></span>
              <div class="text-right">
                <span class="text-[9px] font-mono text-slate-400 block">SUBTOTAL</span>
                <span class="font-mono font-black text-slate-900 text-sm">S/ {{ item.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- DESKTOP (>= md): Tabla completa -->
      <div class="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 class="text-xs font-bold text-slate-900">Detalle de Repuestos &amp; Descarga de Stock</h3>
            <p class="text-[11px] text-slate-500">Descuento físico inmediato en almacén</p>
          </div>
          <span class="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
            {{ items().length }} repuestos
          </span>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 text-slate-500 font-mono font-bold uppercase text-[9px] border-b border-slate-200 tracking-wider">
                <th class="px-4 py-3">SKU / Descripción &amp; Marca</th>
                <th class="px-4 py-3 text-center">Cant.</th>
                <th class="px-4 py-3 text-center">Tarifa</th>
                <th class="px-4 py-3">Lote / Proveedor de Salida</th>
                <th class="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of items(); track item.productId) {
                @let currentStock = getSelectedSupplierStock(item);
                @let hasDeficit = currentStock < item.quantity;

                <tr [class.bg-rose-50/50]="hasDeficit" class="hover:bg-slate-50/60 transition-colors">
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs font-black text-slate-900 block">{{ item.code }}</span>
                    <span class="text-slate-800 font-medium">{{ item.name }}</span>
                    <span class="text-[11px] text-slate-400 block">{{ item.brand }}</span>
                  </td>
                  
                  <td class="px-4 py-3 text-center font-bold text-slate-800 text-sm">
                    {{ item.quantity }} <span class="text-xs font-normal text-slate-500">un</span>
                  </td>
                  
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          [ngClass]="item.priceTier === 3 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                      T{{ item.priceTier }} (S/ {{ item.unitPrice | number:'1.2-2' }})
                    </span>
                  </td>
                  
                  <td class="px-4 py-3">
                    @if (item.availableSuppliers.length > 0) {
                      <div class="space-y-1">
                        <select [ngModel]="item.supplierId"
                                (ngModelChange)="supplierChanged.emit({ productId: item.productId, supplierId: $event })"
                                [ngClass]="hasDeficit ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500' : 'border-slate-300 bg-white focus:border-emerald-700'"
                                class="w-full text-xs py-1.5 px-2 border rounded-lg outline-none font-medium transition-colors">
                          @for (sup of item.availableSuppliers; track sup.id) {
                            <option [value]="sup.id">
                              {{ sup.name }} ({{ sup.stock }} disponibles)
                            </option>
                          }
                        </select>

                        @if (hasDeficit) {
                          <p class="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                            <span>⚠ Lote con stock insuficiente ({{ currentStock }} de {{ item.quantity }}).</span>
                          </p>
                        }
                      </div>
                    } @else {
                      <span class="text-rose-600 text-[11px] italic font-semibold">Sin stock en almacén</span>
                    }
                  </td>
                  
                  <td class="px-4 py-3 text-right font-mono font-black text-slate-900 text-sm">
                    S/ {{ item.subtotal | number:'1.2-2' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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