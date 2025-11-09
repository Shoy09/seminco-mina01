import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-meta',
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-edit-meta.component.html',
  styleUrl: './dialog-edit-meta.component.css'
})
export class DialogEditMetaComponent {
  metaData: any;

  constructor(
    public dialogRef: MatDialogRef<DialogEditMetaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.metaData = { ...data };
  }

  guardarCambios(): void {
    this.dialogRef.close(this.metaData);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
