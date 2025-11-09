import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlanMantenimiento, SubPlanMantenimiento } from '../../../../models/plan-mantenimiento.model';
import { MatIcon } from "@angular/material/icon";
import { PlanMantenimientoService } from '../../../../services/plan-mantenimiento.service';
@Component({
  selector: 'app-edit-plan-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIcon
],
  templateUrl: './edit-plan-mantenimiento.component.html',
  styleUrls: ['./edit-plan-mantenimiento.component.css']
})
export class EditPlanMantenimientoComponent implements OnInit {
  plan!: PlanMantenimiento;
  subplanes: SubPlanMantenimiento[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlanMantenimiento,
    private dialogRef: MatDialogRef<EditPlanMantenimientoComponent>,
    private planService: PlanMantenimientoService
  ) {}
  ngOnInit() {
    this.plan = { ...this.data };
    this.subplanes = this.data.subplanes ? [...this.data.subplanes] : [];
  }
  guardarCambios() {
  this.plan.subplanes = this.subplanes;
  if (this.plan.id) {
    this.planService.updatePlanMantenimiento(this.plan.id, this.plan).subscribe({
      next: (planActualizado) => {
        this.dialogRef.close(planActualizado);
      },
      error: (err) => {
        console.error('Error al actualizar el plan:', err);
      }
    });
  } else {
    console.error('El plan no tiene ID, no se puede actualizar.');
  }
}
  cancelar() {
    this.dialogRef.close(null);
  }
}
