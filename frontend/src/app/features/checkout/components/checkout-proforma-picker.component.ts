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
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <!-- Header del Selector de Caja -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">COBRO EN MOSTRADOR</span>
            <h2 class="text-sm font-extrabold text-slate-900 tracking-tight mt-0.5">Proformas Listas para Facturar</h2>
            <p class="text-xs text-slate-500">Selecciona una cotización para cargar los datos fiscales y descargar inventario</p>
          </div>

          <div class="relative w-full sm:w-72">
            <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por código o cliente..."
                   class="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 transition-all" />
            <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- Listado de Proformas Disponibles -->
        <div class="divide-y divide-slate-100">
          @for (p of filteredProformas(); track p.id) {
            <div (click)="selectProforma.emit(p.id)"
                 class="p-4 sm:px-5 hover:bg-slate-50/70 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-600 flex items-center justify-center font-mono text-xs font-bold transition-colors shrink-0">
                  {{ $index + 1 }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-mono text-xs font-black text-slate-900 group-hover:text-emerald-900">{{ p.code }}</span>
                    <span class="px-2 py-0.2 text-[9px] font-mono font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      {{ p.status }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-600 font-medium block truncate mt-0.5">{{ p.customer?.name || 'Cliente Mostrador' }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div class="text-left sm:text-right">
                  <span class="text-[9px] text-slate-400 uppercase font-mono block">Total a Cobrar</span>
                  <span class="font-mono text-sm font-black text-slate-900">S/ {{ p.totalAmount | number:'1.2-2' }}</span>
                </div>
                <button type="button" class="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 group-hover:bg-emerald-900 rounded-lg shadow-2xs transition-all">
                  Cargar a Caja &rarr;
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-10 text-center text-slate-400 text-xs space-y-1">
              <span class="text-xl block">📦</span>
              <p class="font-medium">No se encontraron proformas pendientes de facturación.</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Modal para cambio rápido -->
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div>
              <h3 class="text-xs font-bold text-slate-900">Cambiar Proforma en Caja</h3>
              <p class="text-[10px] text-slate-400">Selecciona la cotización a despachar</p>
            </div>
            <button (click)="closeModal.emit()" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer leading-none">&times;</button>
          </div>

          <div class="overflow-y-auto divide-y divide-slate-100 flex-1">
            @for (p of proformas(); track p.id) {
              <div (click)="selectProforma.emit(p.id)" class="p-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs transition-colors">
                <div>
                  <span class="font-mono font-bold text-slate-900 block">{{ p.code }}</span>
                  <span class="text-slate-600 truncate max-w-[200px] block">{{ p.customer?.name }}</span>
                </div>
                <span class="font-mono font-bold text-emerald-800 text-sm">S/ {{ p.totalAmount | number:'1.2-2' }}</span>
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