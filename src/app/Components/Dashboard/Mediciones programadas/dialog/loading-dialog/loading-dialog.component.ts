import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-dialog',
  imports: [MatProgressSpinner, MatIcon, CommonModule ],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.css'
})
export class LoadingDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { cargando: boolean, mensaje: string, error?: boolean }) {}
}