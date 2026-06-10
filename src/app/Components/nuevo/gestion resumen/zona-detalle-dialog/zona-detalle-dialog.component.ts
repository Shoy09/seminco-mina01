import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface ZonaAgrupada {
  nombre: string;
  labores: LaborFila[];
}
interface LaborFila {
  proceso: string;
  zona: string;
  labor: string;
  programado: number;
  real: number;
  ancho: number;
  alto: number;
  anchoReal: number;  // Ejecutado
  altoReal: number;   // Ejecutado
  fechaUltima?: string | null;
  turnoUltimo?: string | null;
  color?: string;
  etapaFinal?: EventoTipo | null;
}

type EventoTipo = 'PERFORADO' | 'DISPARADA' | 'LIMPIEZA' | 'ACARREO' | 'SOSTENIMIENTO';

@Component({
  selector: 'app-zona-detalle-dialog',
  imports: [CommonModule],
  templateUrl: './zona-detalle-dialog.component.html',
  styleUrl: './zona-detalle-dialog.component.css'
})
export class ZonaDetalleDialogComponent {
  @Input() zonas: ZonaAgrupada[] = [];

  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  mostrarTooltip(event: MouseEvent, labor: any) {
    this.tooltipVisible = true;
    this.tooltipLabor = labor;
    this.tooltipX = event.clientX + 15;
    this.tooltipY = event.clientY + 15;
  }

  ocultarTooltip() {
    this.tooltipVisible = false;
  }

  getPorcentaje(real: number, prog: number): number {
    return prog > 0 ? (real / prog) * 100 : 0;
  }
}