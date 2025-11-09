import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PlanMensual } from '../../../../models/plan-mensual.model';

@Component({
  selector: 'app-plan-detalles-dialog',
  imports: [MatDialogModule, CommonModule],
  templateUrl: './plan-detalles-dialog.component.html',
  styleUrls: ['./plan-detalles-dialog.component.css']
})
export class PlanDetallesDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlanDetallesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMensual
  ) {}

  cerrarDialogo(): void {
    this.dialogRef.close();
  }

  obtenerCamposDinamicos(): string[] {
    return Object.keys(this.plan).filter(
      key =>
        ![  // Filtramos las claves que no deseamos mostrar
          'id', 'anio', 'mes', 'minado_tipo', 'empresa', 'zona', 'area',
          'tipo_mineral', 'fase', 'estructura_veta', 'nivel', 'tipo_labor',
          'labor', 'ala', 'avance_m', 'ancho_m', 'alto_m', 'tms', 'programado'
        ].includes(key)
    );
  }

  // Función para agrupar los campos col_XA y col_XB
  obtenerCamposAgrupados(): any[] {
    const campos = this.obtenerCamposDinamicos();
    const camposAgrupados = [];
    for (let i = 1; i <= Math.ceil(campos.length / 2); i++) {
      const colA = campos.find(field => field === `col_${i}A`);
      const colB = campos.find(field => field === `col_${i}B`);
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
