import { Component, Inject } from '@angular/core';
import { PlanMetraje } from '../../../../models/plan_metraje.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlanMetrajeService } from '../../../../services/plan-metraje.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-plan-metraje',
  imports: [FormsModule],
  templateUrl: './edit-plan-metraje.component.html',
  styleUrl: './edit-plan-metraje.component.css'
})
export class EditPlanMetrajeComponent {
  constructor(
    public dialogRef: MatDialogRef<EditPlanMetrajeComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMetraje,
    private planService: PlanMetrajeService,
    private _toastr: ToastrService
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanMetraje(this.plan.id, this.plan).subscribe({
        next: (respuesta) => {
          this._toastr.success('Plan actualizado con éxito', 'Éxito'); 
          this.dialogRef.close(respuesta); // Cierra el diálogo con los datos actualizados
        },
        error: (error) => {
          this._toastr.error('Error al actualizar el plan', 'Error');
        }
      });
    } else {
      this._toastr.warning('El plan no tiene un ID válido', 'Advertencia');
    }
  }
  
  
  cancelar(): void {
    this.dialogRef.close(); // Cerramos sin enviar cambios
  }
}
