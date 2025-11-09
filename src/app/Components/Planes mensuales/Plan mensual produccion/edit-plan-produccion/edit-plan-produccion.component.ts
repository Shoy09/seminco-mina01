import { Component, Inject } from '@angular/core';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-plan-produccion',
  imports: [FormsModule],
  templateUrl: './edit-plan-produccion.component.html',
  styleUrl: './edit-plan-produccion.component.css'
})
export class EditPlanProduccionComponent { 
  constructor(
    public dialogRef: MatDialogRef<EditPlanProduccionComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanProduccion,
    private planService: PlanProduccionService,
    private _toastr: ToastrService
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanProduccion(this.plan.id, this.plan).subscribe({
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
