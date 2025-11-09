import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-operaciones-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Operaciones Permitidas</h2>
    <mat-dialog-content>
      <ul>
        <li *ngFor="let operacion of data">{{ operacion }}</li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class OperacionesDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
}
