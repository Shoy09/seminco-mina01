import { Component, Inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Estado } from '../../../models/Estado';
import { EstadoService } from '../../../services/estado.service';

@Component({
  selector: 'app-estado-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './estado-form.component.html',
  styleUrl: './estado-form.component.css'
})
export class EstadoFormComponent {
  estadoForm: FormGroup;
  mensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    public dialogRef: MatDialogRef<EstadoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proceso: string } // 🔵 Recibimos el estado
  )
  {
    this.estadoForm = this.fb.group({
      proceso: [{ value: this.data.proceso, disabled: true }], // 🟢 Campo de solo lectura
      estado_principal: ['', Validators.required],
      codigo: ['', Validators.required],
      tipo_estado: ['', Validators.required],
      categoria: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.estadoForm.valid) {
      this.estadoForm.get('proceso')?.enable(); // Habilita el campo antes de obtener el valor
      const nuevoEstado: Estado = this.estadoForm.value;
      this.estadoForm.get('proceso')?.disable(); // Lo vuelve a deshabilitar
  
      this.estadoService.createEstado(nuevoEstado).subscribe({
        next: (response) => {
          this.mensaje = 'Estado creado exitosamente!';
          this.estadoForm.reset();
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error al crear el estado:', error);
          this.mensaje = 'Ocurrió un error al crear el estado.';
        }
      });
    }
  }
  

  onCancel(): void {
    this.dialogRef.close(); // Cierra el diálogo sin hacer nada
  }
}
