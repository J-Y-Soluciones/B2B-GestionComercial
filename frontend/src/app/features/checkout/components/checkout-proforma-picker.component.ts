import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ProformaDto } from '../../../core/services/proformas.service';

@Component({
    selector: 'app-checkout-proforma-picker',
    standalone: true,
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (!isModal()) {
      <div class="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header del Selector de Caja -->
        <div class="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shadow-2xs">
              ⚡
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900">Proformas Listas para Cobro en Mostrador</h2>
              <p class="text-xs text-slate-500">Selecciona una cotización aprobada para cargar datos fiscales y descargar inventario</p>
            </div>
          </div>

          <div class="relative w-full md:w-72">
            <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por código o cliente..."
                   class="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all" />
            <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- Tabla / Listado de Proformas Disponibles -->
        <div class="divide-y divide-slate-100">
          @for (p of filteredProformas(); track p.id) {
            <div (click)="selectProforma.emit(p.id)"
                 class="px-6 py-4 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-600 flex items-center justify-center font-mono text-xs font-bold transition-colors">
                  {{ $index + 1 }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-black text-slate-900 group-hover:text-emerald-900">{{ p.code }}</span>
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {{ p.status }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-600 font-medium block mt-0.5">{{ p.customer?.name || 'Cliente Mostrador' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold block">Total a Cobrar</span>
                  <span class="font-mono text-sm font-black text-slate-900">S/ {{ p.totalAmount | number:'1.2-2' }}</span>
                </div>
                <button type="button" class="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 group-hover:bg-emerald-900 rounded-lg shadow-2xs transition-all">
                  Cargar a Caja →
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-12 text-center text-slate-400 text-xs space-y-2">
              <span class="text-2xl block">📦</span>
              <p class="font-medium">No se encontraron proformas pendientes de facturación.</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Modal para cambio rápido si ya hay una proforma abierta -->
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 border border-slate-200">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-800">Cambiar Proforma en Caja</h3>
            <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
          </div>
          <div class="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            @for (p of proformas(); track p.id) {
              <div (click)="selectProforma.emit(p.id)" class="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs">
                <div>
                  <span class="font-mono font-bold text-slate-900 block">{{ p.code }}</span>
                  <span class="text-slate-600">{{ p.customer?.name }}</span>
                </div>
                <span class="font-mono font-bold text-emerald-800">S/ {{ p.totalAmount | number:'1.2-2' }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class CheckoutProformaPickerComponent {
    proformas = input.required<ProformaDto[]>();
    isModal = input<boolean>(false);
    selectProforma = output<string>();
    closeModal = output<void>();

    searchTerm = signal<string>('');

    filteredProformas = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.proformas();
        return this.proformas().filter(p =>
            p.code.toLowerCase().includes(term) ||
            (p.customer?.name && p.customer.name.toLowerCase().includes(term))
        );
    });
}