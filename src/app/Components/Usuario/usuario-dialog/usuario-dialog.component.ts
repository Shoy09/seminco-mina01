import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-usuario-dialog',
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, CommonModule, MatCardModule, MatSelectModule ],
  templateUrl: './usuario-dialog.component.html',
  styleUrl: './usuario-dialog.component.css'
})
export class UsuarioDialogComponent {
  usuarioForm: FormGroup;
  editMode = false;
  operacionesDisponibles = [
    'ACARREO',
    'CARGUÍO',
    'EXPLOSIVOS',
    'MEDICIONES',
    'SOSTENIMIENTO',
    'SERVICIOS AUXILIARES',
    'ACEROS DE PERFORACIÓN',
    'PERFORACIÓN HORIZONTAL',
    'PERFORACIÓN TALADROS LARGOS'
  ];
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    public dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario
  ) {
    this.editMode = !!data;
  
    this.usuarioForm = this.fb.group(
      {
        codigo_dni: [data?.codigo_dni || '', Validators.required],
        apellidos: [data?.apellidos || '', Validators.required],
        nombres: [data?.nombres || '', Validators.required],
        correo: [data?.correo || '', [Validators.required, Validators.email]],
        cargo: [data?.cargo || ''],
        empresa: [data?.empresa || ''],
        guardia: [data?.guardia || ''],
        autorizado_equipo: [data?.autorizado_equipo || ''],
        rol: [data?.rol || '', Validators.required],
        operaciones_autorizadas: [data?.operaciones_autorizadas || []],
      },
      { validators: this.passwordsCoinciden } // 👈 Agregar validador aquí
    );
    
    if (!this.editMode) {
      this.usuarioForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
      this.usuarioForm.addControl('confirmPassword', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }    
  }
  
  passwordsCoinciden(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { noCoincide: true };
  }
  
guardar() {
  if (this.usuarioForm.valid) {
    const formValue = this.usuarioForm.value;

    const operacionesObj: { [key: string]: boolean } = {};
    if (Array.isArray(formValue.operaciones_autorizadas)) {
      formValue.operaciones_autorizadas.forEach((op: string) => {
        operacionesObj[op] = true;
      });
    }

    const usuarioData = {
      ...formValue,
      operaciones_autorizadas: operacionesObj
    };

    this.usuarioService.crearUsuario(usuarioData).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}


  cancelar() {
    this.dialogRef.close();
  }
} 
