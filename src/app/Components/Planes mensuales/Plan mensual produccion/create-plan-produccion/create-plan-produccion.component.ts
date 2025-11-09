import { Component, Inject } from '@angular/core';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { ToastrService } from 'ngx-toastr';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-plan-produccion',
  imports: [MatFormFieldModule, MatDialogModule, CommonModule, MatInputModule, FormsModule, ReactiveFormsModule, MatSelectModule ],
  templateUrl: './create-plan-produccion.component.html',
  styleUrl: './create-plan-produccion.component.css'
})
export class CreatePlanProduccionComponent {
  planForm: FormGroup;
  camposDinamicos: string[] = [];

  constructor(
    private fb: FormBuilder,
    private planProduccionService: PlanProduccionService,
    public dialogRef: MatDialogRef<CreatePlanProduccionComponent>,
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
      ag_gr: [''],
      porcentaje_cu: [''],
      porcentaje_pb: [''],
      porcentaje_zn: [''],
      vpt_act: [''],
      vpt_final: [''],
      cut_off_1: [''],
      cut_off_2: [''],
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

      const nuevoPlan: PlanProduccion = {
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
        ag_gr: formData.ag_gr,
        porcentaje_cu: formData.porcentaje_cu,
        porcentaje_pb: formData.porcentaje_pb,
        porcentaje_zn: formData.porcentaje_zn,
        vpt_act: formData.vpt_act,
        vpt_final: formData.vpt_final,
        cut_off_1: formData.cut_off_1,
        cut_off_2: formData.cut_off_2,
        programado: formData.programado,
      }; 

      // Agregar campos dinámicos
      this.camposDinamicos.forEach((campo) => {
        nuevoPlan[`columna_${campo}`] = formData[campo] || null;
      });

      this.planProduccionService.createPlanProduccion(nuevoPlan).subscribe({
        next: () => {
          this._toastr.success('Plan de producción creado exitosamente', 'Éxito');
          this.dialogRef.close(true);
        },
        error: () => {
          this._toastr.error('Hubo un problema al crear el plan de producción', 'Error');
        }
      });
    } else {
      this._toastr.warning('Por favor, complete todos los campos requeridos', 'Advertencia');
    }
  }
}