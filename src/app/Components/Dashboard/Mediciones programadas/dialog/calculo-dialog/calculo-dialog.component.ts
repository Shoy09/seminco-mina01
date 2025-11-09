import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  titulo: string;
  descripcion: string;
  formula: string;
  datosMuestra?: any[];
  columnas?: string[];
  observaciones?: string[];
}

@Component({
  selector: 'app-calculo-dialog',
  imports: [CommonModule],
  templateUrl: './calculo-dialog.component.html',
  styleUrl: './calculo-dialog.component.css'
})
export class CalculoDialogComponent {
 constructor(
    public dialogRef: MatDialogRef<CalculoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}