import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { SubPlanMantenimiento } from '../../../../models/plan-mantenimiento.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-plan-mantenimiento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule 
  ],
  templateUrl: './plan-mantenimiento-dialog.component.html',
  styleUrls: ['./plan-mantenimiento-dialog.component.css']
})
export class PlanMantenimientoDialogComponent {
  displayedColumns: string[] = [
    'id',
    'sistema',
    'frecuencia',
    'h_parada',
    'dias',
    'actividades',
    'cumplimiento'
  ];
  dataSource: SubPlanMantenimiento[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataSource = data?.subplanes ?? [];
  }

  // Método auxiliar para mostrar los días activos
  getDias(subplan: SubPlanMantenimiento): string {
    const dias: string[] = [];
    if (subplan.lunes) dias.push('L');
    if (subplan.martes) dias.push('M');
    if (subplan.miercoles) dias.push('X');
    if (subplan.jueves) dias.push('J');
    if (subplan.viernes) dias.push('V');
    if (subplan.sabado) dias.push('S');
    if (subplan.domingo) dias.push('D');
    return dias.join(', ') || '-';
  }

  
}
