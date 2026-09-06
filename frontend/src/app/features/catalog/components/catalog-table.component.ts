import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-catalog-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
              <th class="py-3 px-3 text-center w-10">#</th>
              <th class="py-3 px-4">SKU / Descripción & Marca</th>
              <th class="py-3 px-4">Categoría / OEM</th>
              <th class="py-3 px-4 text-center">Matriz de Precios B2B (Tiers)</th>
              <th class="py-3 px-4 text-center">Existencias Consolidadas</th>
              <th class="py-3 px-4 text-center">Estado Stock</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @if (products().length === 0 && !isLoading()) {
              <tr>
                <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                  No se encontraron repuestos con los criterios ingresados.
                </td>
              </tr>
            }

            @for (prod of products(); track prod.id; let idx = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <!-- # Secuencial -->
                <td class="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                  {{ (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1) }}
                </td>

                <!-- SKU y Descripción -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span [class]="getSkuBadgeColor(idx)" class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase">
                      {{ prod.internalCode }}
                    </span>
                    <span class="font-bold text-slate-900 text-xs">{{ prod.name }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    <strong class="text-slate-700 font-semibold">{{ prod.brand }}</strong> &bull;
                    <span>Aplicación: General B2B</span>
                  </div>
                </td>

                <!-- Categoría y OEM -->
                <td class="py-3 px-4">
                  <div class="text-slate-800 font-medium text-[11px]">{{ prod.category }}</div>
                  <div class="text-[10px] font-mono text-slate-400 mt-0.5">
                    # OEM: {{ getOemCode(prod) }}
                  </div>
                </td>

                <!-- Matriz de Precios B2B -->
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5 font-mono text-[10px]">
                    <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      T1 Normal: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 1) | number:'1.2-2' }}</strong>
                    </span>
                    <span class="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      T2 Taller: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 2) | number:'1.2-2' }}</strong>
                    </span>
                    <span class="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-900 font-bold">
                      T3 Mayor: <strong class="text-emerald-950">S/ {{ getTierPrice(prod, 3) | number:'1.2-2' }}</strong>
                    </span>
                  </div>
                </td>

                <!-- Existencias Consolidadas -->
                <td class="py-3 px-4 text-center">
                  <div class="font-mono font-black text-xs text-slate-900">
                    {{ prod.totalStock }} unidades en red
                  </div>
                  <div class="text-[9px] font-mono text-slate-400 mt-0.5">
                    Lima: {{ getStockBreakdown(prod, 0) }} &bull; Callao: {{ getStockBreakdown(prod, 1) }} &bull; Mayorista: {{ getStockBreakdown(prod, 2) }}
                  </div>
                </td>

                <!-- Estado Stock -->
                <td class="py-3 px-4 text-center">
                  @if (prod.totalStock === 0) {
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Agotado
                    </span>
                  } @else if (prod.totalStock <= prod.minStock) {
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Crítico ({{ prod.totalStock }} un)
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Stock Óptimo
                    </span>
                  }
                </td>

                <!-- Acciones -->
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <button type="button" (click)="openStock.emit(prod)"
                      class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                      ↗ Kardex ({{ prod.stocks?.length || 0 }})
                    </button>
                    @if (canManage()) {
                      <button type="button" (click)="openEdit.emit(prod)"
                        class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Editar Ficha Técnica">
                        ✏️
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
  `
})
export class CatalogTableComponent {
    products = input.required<Product[]>();
    isLoading = input<boolean>(false);
    canManage = input<boolean>(false);

    openStock = output<Product>();
    openEdit = output<Product>();

    getTierPrice(product: Product, tierNumber: number): number {
        const t = product.priceTiers?.find((item) => item.tier === tierNumber);
        return t ? Number(t.price) : 0;
    }

    getSkuBadgeColor(idx: number): string {
        const colors = [
            'bg-blue-50 text-blue-800 border-blue-200',
            'bg-amber-50 text-amber-800 border-amber-200',
            'bg-emerald-50 text-emerald-800 border-emerald-200',
            'bg-rose-50 text-rose-800 border-rose-200',
            'bg-purple-50 text-purple-800 border-purple-200',
        ];
        return colors[idx % colors.length];
    }

    getOemCode(prod: Product): string {
        const stockWithSku = prod.stocks?.find(s => s.supplierSku);
        return stockWithSku?.supplierSku || `${prod.internalCode}-OEM`;
    }

    getStockBreakdown(prod: Product, index: number): number {
        if (!prod.stocks || prod.stocks.length === 0) return 0;
        return prod.stocks[index]?.stock || 0;
    }
}