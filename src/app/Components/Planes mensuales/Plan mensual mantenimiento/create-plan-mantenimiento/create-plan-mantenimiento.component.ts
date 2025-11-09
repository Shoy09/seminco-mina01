import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { PlanMantenimiento, SubPlanMantenimiento } from '../../../../models/plan-mantenimiento.model';
import { PlanMantenimientoService } from '../../../../services/plan-mantenimiento.service';

@Component({
  selector: 'app-create-plan-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './create-plan-mantenimiento.component.html',
  styleUrls: ['./create-plan-mantenimiento.component.css']
})
export class CreatePlanMantenimientoComponent implements OnInit {
  plan: PlanMantenimiento = {
    id: 0,
    zona: '',
    cod_equipo: '',
    equipo: '',
    subplanes: []
  };

  subplanes: SubPlanMantenimiento[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreatePlanMantenimientoComponent>,
    private planService: PlanMantenimientoService
  ) {}

  ngOnInit(): void {}

  agregarSubplan(): void {
    const nuevoSubplan: SubPlanMantenimiento = {
      id: 0,
      sistema: '',
      frecuencia: '',
      h_parada: 0,
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: false,
      domingo: false,
      actividades: '',
      cumplimiento: 0
    };
    this.subplanes.push(nuevoSubplan);
  }

  eliminarSubplan(index: number): void {
    this.subplanes.splice(index, 1);
  }

  guardarPlan(): void {
    this.plan.subplanes = this.subplanes;

    this.planService.createPlanMantenimiento(this.plan).subscribe({
      next: (nuevoPlan) => {
        console.log('Plan creado:', nuevoPlan);
        this.dialogRef.close(nuevoPlan);
      },
      error: (err) => {
        console.error('Error al crear plan:', err);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
