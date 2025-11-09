import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SemanaService } from '../../../services/semana.service';
import { Semana } from '../../../models/semana.model';
import { Empresa } from '../../../models/empresa';

@Component({
  selector: 'app-semana-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './semana-dialog.component.html',
  styleUrls: ['./semana-dialog.component.css']
})
export class SemanaDialogComponent implements OnInit {
  semanaForm!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private semanaService: SemanaService,
    public dialogRef: MatDialogRef<SemanaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      semana: Semana | null, 
      empresa: Empresa 
    }
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.semana;
    this.initForm();
  }

  initForm(): void {
    this.semanaForm = this.fb.group({
      numero_semana: [null, [Validators.required, Validators.min(1), Validators.max(53)]],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      rangoFechas: this.fb.group({
        start: [null, Validators.required],
        end: [null, Validators.required]
      })
    });

    if (this.isEdit && this.data.semana) {
      this.semanaForm.patchValue({
        numero_semana: this.data.semana.numero_semana,
        anio: this.data.semana.anio,
        rangoFechas: {
          start: new Date(this.data.semana.fecha_inicio),
          end: new Date(this.data.semana.fecha_fin)
        }
      });
    }
  }

  onSubmit(): void {
    if (this.semanaForm.invalid || !this.data.empresa.id) return;

    const formValue = this.semanaForm.value;
    const fecha_inicio = formValue.rangoFechas.start.toISOString().split('T')[0];
    const fecha_fin = formValue.rangoFechas.end.toISOString().split('T')[0];

    const semana: Semana = {
      numero_semana: formValue.numero_semana,
      anio: formValue.anio,
      fecha_inicio,
      fecha_fin,
      empresa_id: this.data.empresa.id
    };

    if (this.isEdit && this.data.semana?.id) {
      this.semanaService.updateSemana(this.data.empresa.id, this.data.semana.id, semana).subscribe({
        next: () => this.dialogRef.close('saved'),
        error: (err) => console.error('Error al actualizar semana:', err)
      });
    } else {
      this.semanaService.createSemana(this.data.empresa.id, semana).subscribe({
        next: () => this.dialogRef.close('saved'),
        error: (err) => console.error('Error al crear semana:', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}