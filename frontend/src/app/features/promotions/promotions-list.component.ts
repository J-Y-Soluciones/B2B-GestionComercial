import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-promotions-list',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight">Promociones & Descuentos por Liquidación</h1>
          <p class="text-xs text-slate-500 mt-0.5">Gestión de campañas masivas, remate de stock y escalas por volumen</p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Módulo Modular v1.2 (En Definición Contable)
        </span>
      </div>

      <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-sm">
        <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
          %
        </div>
        <div class="max-w-md mx-auto">
          <h3 class="text-sm font-bold text-slate-800">Módulo en Configuración de Reglas Comerciales</h3>
          <p class="text-xs text-slate-500 mt-1">
            La parametrización de descuentos por volumen de llantas/repuestos y promociones de temporada se habilitará una vez cerradas las directivas contables.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PromotionsListComponent { }