// frontend/src/app/features/promotions/promotions-list.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotions-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4 sm:space-y-6 font-sans">
      
      <!-- ENCABEZADO ESTANDARIZADO -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div class="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            COMERCIAL &bull; POLÍTICA DE PRECIOS &bull; CAMPAÑAS
          </div>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
              Promociones &amp; Descuentos por Liquidación
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Próxima Fase
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Gestión de campañas masivas, liquidación de inventario y escalas por volumen.
          </p>
        </div>
      </div>

      <!-- PLACEHOLDER CORPORATIVO -->
      <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-14 text-center space-y-3.5 shadow-2xs">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto text-lg font-bold shadow-2xs">
          %
        </div>
        <div class="max-w-md mx-auto space-y-1">
          <h3 class="text-sm font-bold text-slate-900">Módulo en Configuración de Reglas Comerciales</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            La parametrización de descuentos por volumen y remate de stock se activará una vez consolidadas las directivas contables.
          </p>
        </div>
      </div>

    </div>
  `
})
export class PromotionsListComponent { }