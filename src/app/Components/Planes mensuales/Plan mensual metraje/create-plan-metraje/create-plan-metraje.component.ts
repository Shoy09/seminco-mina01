import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PlanMetrajeService } from '../../../../services/plan-metraje.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PlanMetraje } from '../../../../models/plan_metraje.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-create-plan-metraje',
  imports: [MatFormFieldModule, MatDialogModule, CommonModule, MatInputModule, FormsModule, ReactiveFormsModule, MatSelectModule ],
  templateUrl: './create-plan-metraje.component.html',
  styleUrl: './create-plan-metraje.component.css'
})
export class CreatePlanMetrajeComponent {
  planForm: FormGroup;
  camposDinamicos: string[] = []; // Campos dinámicos 1A - 28B

  constructor(
    private fb: FormBuilder,
    private PlanMetrajeService: PlanMetrajeService,
    public dialogRef: MatDialogRef<CreatePlanMetrajeComponent>,
    private _toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.camposDinamicos = this.generarCamposDinamicos();
    
    this.planForm = this.fb.group({
      anio: [{ value: data.anio, disabled: true }],
      mes: [{ value: data.mes, disabled: true }],
      semana: [''],
      mina: [''],
      zona: [''],
      area: [''],
      fase: [''],
      minado_tipo: [''],
      tipo_labor: [''],
      tipo_mineral: [''],
      estructura_veta: [''],
      nivel: [''],
      block: [''],
      labor: [''],
      ala: [''],
      ancho_veta: [''],
      ancho_minado_sem: [''],
      ancho_minado_mes: [''],
      burden: [''],
      espaciamiento: [''],
      longitud_perforacion: [''],
      programado: [{ value: 'No Programado', disabled: true }],
    });

    this.camposDinamicos.forEach((campo) => {
      this.planForm.addControl(campo, this.fb.control(''));
    });
  }

  generarCamposDinamicos(): string[] {
    const campos = [];
    for (let i = 1; i <= 28; i++) {
      campos.push(`${i}A`);
      campos.push(`${i}B`);
    }
    return campos;
  }

  cancelar(): void {
    this.dialogRef.close();
  }
  
  
  guardar(): void {
    if (this.planForm.valid) {
      this.planForm.get('anio')?.enable();
      this.planForm.get('mes')?.enable();
      this.planForm.get('programado')?.enable();
  
      const formData = this.planForm.value;
  
      const nuevoPlan: PlanMetraje = {
        anio: formData.anio,
        mes: formData.mes,
        semana: formData.semana,
        mina: formData.mina,
        zona: formData.zona,
        area: formData.area,
        fase: formData.fase,
        minado_tipo: formData.minado_tipo,
        tipo_labor: formData.tipo_labor,
        tipo_mineral: formData.tipo_mineral,
        estructura_veta: formData.estructura_veta,
        nivel: formData.nivel,
        block: formData.block,
        labor: formData.labor,
        ala: formData.ala,
        ancho_veta: formData.ancho_veta,
        ancho_minado_sem: formData.ancho_minado_sem,
        ancho_minado_mes: formData.ancho_minado_mes,
        burden: formData.burden,
        espaciamiento: formData.espaciamiento,
        longitud_perforacion: formData.longitud_perforacion,
        programado: formData.programado,
      };

      // Agregar campos dinámicos
      this.camposDinamicos.forEach((campo) => {
        nuevoPlan[`columna_${campo}`] = formData[campo] || null;
      });
  
      this.PlanMetrajeService.createPlanMetraje(nuevoPlan).subscribe({
        next: () => {
          this._toastr.success('Plan creado exitosamente', 'Éxito');
          this.dialogRef.close(true);
        },
        error: () => {
          this._toastr.error('Hubo un problema al crear el plan', 'Error');
        }
      });
    } else {
      this._toastr.warning('Por favor, complete todos los campos requeridos', 'Advertencia');
    }
  }
}