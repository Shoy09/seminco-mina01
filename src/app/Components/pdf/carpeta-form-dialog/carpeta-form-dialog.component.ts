// carpeta-form-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CarpetaService } from '../../../services/carpeta-pdf.service';

@Component({
  selector: 'app-carpeta-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './carpeta-form-dialog.component.html',
  styleUrls: ['./carpeta-form-dialog.component.css']
})
export class CarpetaFormDialogComponent {
  carpetaForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private carpetaService: CarpetaService,
    public dialogRef: MatDialogRef<CarpetaFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.carpetaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  crearCarpeta(): void {
    if (this.carpetaForm.invalid) return;
    
    this.loading = true;
    const nombre = this.carpetaForm.get('nombre')?.value;
    
    this.carpetaService.createCarpeta(nombre).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al crear carpeta', error);
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}