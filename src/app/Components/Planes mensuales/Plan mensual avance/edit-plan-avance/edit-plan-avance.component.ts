import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; 
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { PlanMensualService } from '../../../../services/plan-mensual.service';

@Component({
  selector: 'app-edit-plan-avance',
  imports: [FormsModule],
  templateUrl: './edit-plan-avance.component.html',
  styleUrl: './edit-plan-avance.component.css'
})
export class EditPlanAvanceComponent {
 
  constructor(
    public dialogRef: MatDialogRef<EditPlanAvanceComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMensual,
    private planService: PlanMensualService,
    private _toastr: ToastrService
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanMensual(this.plan.id, this.plan).subscribe({
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
