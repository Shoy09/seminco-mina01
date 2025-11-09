import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PlanMetraje } from '../../../../models/plan_metraje.model';

@Component({
  selector: 'app-plan-metraje-detalles-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './plan-metraje-detalles-dialog.component.html',
  styleUrls: ['./plan-metraje-detalles-dialog.component.css']
})
export class PlanMetrajeDetallesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlanMetrajeDetallesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMetraje
  ) {}

  cerrarDialogo(): void {
    this.dialogRef.close();
  } 

  obtenerCamposDinamicos(): string[] {
    return Object.keys(this.plan).filter(
      key =>
        ![
          'id', 'anio', 'mes', 'semana', 'mina', 'zona', 'area', 'fase', 'minado_tipo', 'tipo_labor',
          'tipo_mineral', 'estructura_veta', 'nivel', 'block', 'labor', 'ala',
          'ancho_veta', 'ancho_minado_sem', 'ancho_minado_mes', 'burden', 'espaciamiento', 'longitud_perforacion', 'programado'
        ].includes(key)
    );
  }

  obtenerCamposAgrupados(): any[] {
    const campos = this.obtenerCamposDinamicos();
    const camposAgrupados = [];
    for (let i = 1; i <= Math.ceil(campos.length / 2); i++) {
      const colA = campos.find(field => field === `columna_${i}A`);
      const colB = campos.find(field => field === `columna_${i}B`);
      if (colA || colB) {
        // Extraemos solo la parte después del "_" (1A, 1B, etc.)
        const displayA = colA ? colA.split('_')[1] : null;
        const displayB = colB ? colB.split('_')[1] : null;
        camposAgrupados.push({
          keyA: colA,
          displayA: displayA,
          keyB: colB,
          displayB: displayB
        });
      }
    }
    return camposAgrupados;
  }
}
