// src/app/features/catalog/components/catalog-table.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 font-sans">
      <!-- VISTA MÓVIL (< md): Cards compactas -->
      <div class="block md:hidden space-y-2.5">
        @if (products().length === 0 && !isLoading()) {
          <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs shadow-2xs">
            No se encontraron repuestos registrados con ese criterio.
          </div>
        }

        @for (prod of products(); track prod.id; let idx = $index) {
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-start gap-2.5 min-w-0">
                <div class="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  @if (prod.imageUrl) {
                    <img [src]="prod.imageUrl" [alt]="prod.name" class="w-full h-full object-cover" />
                  } @else {
                    <span class="text-xs text-slate-300">📦</span>
                  }
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span [class]="getSkuBadgeColor(idx)" class="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase">
                      {{ prod.internalCode }}
                    </span>
                    <span class="text-[9px] font-mono text-slate-400 truncate">OEM: {{ getOemCode(prod) }}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs truncate leading-snug mt-0.5">{{ prod.name }}</h4>
                  <div class="text-[10px] text-slate-500 font-mono truncate">
                    <strong class="text-slate-700">{{ prod.brand }}</strong> &bull; {{ prod.category }}
                  </div>
                </div>
              </div>

              <!-- Estado de Stock -->
              <span [class]="getStockBadgeClass(prod)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0">
                <span class="w-1.5 h-1.5 rounded-full" [class]="getStockDotClass(prod)"></span>
                {{ getStockLabel(prod) }}
              </span>
            </div>

            <!-- Matriz de Tiers -->
            <div class="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono text-[10px] text-center">
              <div>
                <span class="text-slate-400 block text-[9px]">T1 Mostrador</span>
                <strong class="text-slate-900">S/ {{ getTierPrice(prod, 1) | number:'1.2-2' }}</strong>
              </div>
              <div class="border-x border-slate-200">
                <span class="text-slate-400 block text-[9px]">T2 Taller</span>
                <strong class="text-slate-900">S/ {{ getTierPrice(prod, 2) | number:'1.2-2' }}</strong>
              </div>
              <div>
                <span class="text-emerald-800 block text-[9px]">T3 Mayor</span>
                <strong class="text-emerald-950 font-black">S/ {{ getTierPrice(prod, 3) | number:'1.2-2' }}</strong>
              </div>
            </div>

            <!-- Footer Card -->
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-400">
              <span>{{ prod.stocks?.length || 0 }} proveedores</span>
              <div class="flex items-center gap-1.5">
                <button type="button" (click)="openStock.emit(prod)"
                  class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shadow-2xs">
                  📦 Lotes ({{ prod.stocks?.length || 0 }})
                </button>
                @if (canManage()) {
                  <button type="button" (click)="openEdit.emit(prod)"
                    class="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer">
                    ✏️
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- VISTA ESCRITORIO (>= md): Tabla Densificada -->
      <div class="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase text-[9px] font-mono font-bold tracking-wider">
                <th class="py-3 px-3 text-center w-8">#</th>
                <th class="py-3 px-4">SKU / Descripción & Marca</th>
                <th class="py-3 px-4">Categoría / OEM</th>
                <th class="py-3 px-4 text-center">Matriz de Precios B2B (Tiers)</th>
                <th class="py-3 px-4 text-center">Existencias Físicas</th>
                <th class="py-3 px-4 text-center">Estado</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (products().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                    No se encontraron repuestos registrados con ese criterio.
                  </td>
                </tr>
              }

              @for (prod of products(); track prod.id; let idx = $index) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                    {{ (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1) }}
                  </td>

                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        @if (prod.imageUrl) {
                          <img [src]="prod.imageUrl" [alt]="prod.name" class="w-full h-full object-cover" />
                        } @else {
                          <span class="text-xs text-slate-300">📦</span>
                        }
                      </div>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span [class]="getSkuBadgeColor(idx)" class="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase">
                            {{ prod.internalCode }}
                          </span>
                          <span class="font-bold text-slate-900 text-xs leading-tight">{{ prod.name }}</span>
                        </div>
                        <div class="text-[11px] text-slate-500 mt-0.5 font-mono">
                          <strong class="text-slate-700">{{ prod.brand }}</strong> &bull; Repuesto Original / Alterno
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="py-3 px-4">
                    <div class="text-slate-800 font-medium text-[11px]">{{ prod.category }}</div>
                    <div class="text-[10px] font-mono text-slate-400 mt-0.5">OEM: {{ getOemCode(prod) }}</div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1 font-mono text-[10px]">
                      <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        T1: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 1) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        T2: <strong class="text-slate-900">S/ {{ getTierPrice(prod, 2) | number:'1.2-2' }}</strong>
                      </span>
                      <span class="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-emerald-900 font-bold">
                        T3: <strong class="text-emerald-950">S/ {{ getTierPrice(prod, 3) | number:'1.2-2' }}</strong>
                      </span>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="font-mono font-black text-xs text-slate-900">{{ prod.totalStock }} un</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ prod.stocks?.length || 0 }} lotes</div>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <span [class]="getStockBadgeClass(prod)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border">
                      <span class="w-1.5 h-1.5 rounded-full" [class]="getStockDotClass(prod)"></span>
                      {{ getStockLabel(prod) }}
                    </span>
                  </td>

                  <td class="py-3 px-4 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <button type="button" (click)="openStock.emit(prod)"
                        class="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono text-[11px] font-semibold cursor-pointer shadow-2xs whitespace-nowrap">
                        📦 Lotes ({{ prod.stocks?.length || 0 }})
                      </button>
                      @if (canManage()) {
                        <button type="button" (click)="openEdit.emit(prod)"
                          class="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
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
      'bg-purple-50 text-purple-800 border-purple-200'
    ];
    return colors[idx % colors.length];
  }

  getOemCode(prod: Product): string {
    const stockWithSku = prod.stocks?.find((s) => s.supplierSku);
    return stockWithSku?.supplierSku || `${prod.internalCode}-OEM`;
  }

  getStockBadgeClass(prod: Product): string {
    if (prod.totalStock === 0) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (prod.totalStock <= prod.minStock) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  getStockDotClass(prod: Product): string {
    if (prod.totalStock === 0) return 'bg-rose-500';
    if (prod.totalStock <= prod.minStock) return 'bg-amber-500 animate-pulse';
    return 'bg-emerald-500';
  }

  getStockLabel(prod: Product): string {
    if (prod.totalStock === 0) return 'Agotado';
    if (prod.totalStock <= prod.minStock) return `Crítico (${prod.totalStock})`;
    return `${prod.totalStock} un`;
  }
}