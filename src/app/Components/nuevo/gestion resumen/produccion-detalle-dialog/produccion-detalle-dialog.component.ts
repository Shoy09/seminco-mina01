import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TooltipLaborComponent } from '../../Dialog/Produccion/tooltip-labor/tooltip-labor.component';

interface LaborFila {
  proceso: string;
  zona: string;
  labor: string;
  programado: number;
  real: number;
  ancho?: number;
  alto?: number;
  anchoReal?: number;
  altoReal?: number;
  fechaUltima?: string | null;
  turnoUltimo?: string | null;
  color?: string;
  etapaFinal?: string | null;
}
@Component({
  selector: 'app-produccion-detalle-dialog',
  imports: [CommonModule, MatDialogModule, TooltipLaborComponent],
  templateUrl: './produccion-detalle-dialog.component.html',
  styleUrl: './produccion-detalle-dialog.component.css'
})
export class ProduccionDetalleDialogComponent {
zonas: { nombre: string; labores: LaborFila[] }[] = [];
  etapa: string | null = null;

  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  constructor(
    public dialogRef: MatDialogRef<ProduccionDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.zonas = data?.zonas ?? [];
    this.etapa = data?.etapa ?? null;
  }

  cerrar() {
    this.dialogRef.close();
  }

  mostrarTooltip(event: MouseEvent, labor: any) {
    this.tooltipVisible = true;
    this.tooltipLabor = labor;
    this.tooltipX = event.clientX + 12;
    this.tooltipY = event.clientY + 12;
  }

  ocultarTooltip() {
    this.tooltipVisible = false;
  }

  getPorcentaje(real: number, programado: number): number {
    return programado > 0 ? (real / programado) * 100 : 0;
  }
}