import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PdfService } from '../../../services/pdf.service';
import { Pdf } from '../../../models/pdf.model';

export interface FormCreateDialogData {
  carpetaId: number;
  carpetaNombre: string;
  pdf?: Pdf; // Si se pasa, es modo edición
}

@Component({
  selector: 'app-form-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './form-create.component.html',
  styleUrl: './form-create.component.css'
})
export class FormCreateComponent implements OnInit {
  form!: FormGroup;
  pdfFile: File | null = null;
  loading = false;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfService,
    public dialogRef: MatDialogRef<FormCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FormCreateDialogData
  ) {}

  ngOnInit(): void {
    this.modoEdicion = !!this.data.pdf;

    this.form = this.fb.group({
      nombre: [this.data.pdf?.nombre ?? '', [Validators.required, Validators.minLength(3)]],
      archivo: [null, this.modoEdicion ? [] : [Validators.required]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.pdfFile = file;
      this.form.patchValue({ archivo: file });
      this.form.get('archivo')?.setErrors(null);
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
      this.form.get('archivo')?.setErrors({ invalidType: true });
      this.pdfFile = null;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.form.get('nombre')!.value);
    formData.append('carpeta_id', String(this.data.carpetaId));
    if (this.pdfFile) {
      formData.append('archivo', this.pdfFile);
    }

    this.loading = true;

    if (this.modoEdicion && this.data.pdf) {
      this.pdfService.updatePdf(this.data.pdf.id, formData).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al actualizar PDF:', err);
          this.loading = false;
        }
      });
    } else {
      this.pdfService.createPdf(formData).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al crear PDF:', err);
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
