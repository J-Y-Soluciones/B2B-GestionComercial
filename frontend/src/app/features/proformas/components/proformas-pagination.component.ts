import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-proformas-pagination',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
      <div>
        Mostrando <strong>{{ startIndex() }} - {{ endIndex() }}</strong> de <strong>{{ totalItems() }}</strong> proformas registradas
      </div>

      <div class="flex items-center gap-1">
        <!-- Anterior -->
        <button type="button"
          (click)="prevPage()"
          [disabled]="currentPage() === 1"
          class="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs">
          &lt; Anterior
        </button>

        <!-- Páginas numéricas -->
        @for (page of pagesArray(); track page) {
          <button type="button"
            (click)="selectPage(page)"
            [class]="currentPage() === page 
              ? 'bg-slate-900 text-white font-bold border-slate-900' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'"
            class="px-2.5 py-1 rounded border cursor-pointer transition-colors shadow-2xs">
            {{ page }}
          </button>
        }

        <!-- Siguiente -->
        <button type="button"
          (click)="nextPage()"
          [disabled]="currentPage() === totalPages() || totalPages() === 0"
          class="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs">
          Siguiente &gt;
        </button>
      </div>
    </div>
  `
})
export class ProformasPaginationComponent {
    currentPage = input.required<number>();
    totalPages = input.required<number>();
    totalItems = input.required<number>();
    startIndex = input.required<number>();
    endIndex = input.required<number>();
    pagesArray = input.required<number[]>();

    pageChange = output<number>();

    selectPage(page: number): void {
        this.pageChange.emit(page);
    }

    prevPage(): void {
        if (this.currentPage() > 1) {
            this.pageChange.emit(this.currentPage() - 1);
        }
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.pageChange.emit(this.currentPage() + 1);
        }
    }
}