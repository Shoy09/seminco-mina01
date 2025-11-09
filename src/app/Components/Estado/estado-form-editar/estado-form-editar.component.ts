import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Estado } from '../../../models/Estado';
import { EstadoService } from '../../../services/estado.service';

@Component({
  selector: 'app-estado-form-editar',
  imports: [ReactiveFormsModule],
  templateUrl: './estado-form-editar.component.html',
  styleUrl: './estado-form-editar.component.css'
})
export class EstadoFormEditarComponent implements OnInit {
  estadoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    public dialogRef: MatDialogRef<EstadoFormEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Estado
  ) {}

  ngOnInit(): void {
    // Inicializa el formulario con los valores del estado recibido
    this.estadoForm = this.fb.group({
      estado_principal: [this.data?.estado_principal || '', Validators.required],
      codigo: [this.data?.codigo || '', Validators.required],
      tipo_estado: [this.data?.tipo_estado || '', Validators.required],
      categoria: [this.data?.categoria || '', Validators.required]
    });
  }

  guardarCambios(): void {
    if (this.estadoForm.valid) {
      const estadoActualizado: Estado = { ...this.data, ...this.estadoForm.value };
  
      this.estadoService.updateEstado(this.data.id, estadoActualizado).subscribe(
        () => {
          this.dialogRef.close(estadoActualizado); // Cierra el diálogo y devuelve los datos actualizados
        },
        (error) => {
          console.error('Error al actualizar el estado:', error);
        }
      );
    }
  }
  

  cerrar(): void {
    this.dialogRef.close();
  }
}
