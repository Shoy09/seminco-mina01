import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { SafeUrlPipe } from "../safe-url.pipe";

@Component({
  selector: 'app-pdf-viewer-dialog',
  imports: [MatDialogContent, SafeUrlPipe],
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrl: './pdf-viewer-dialog.component.css'
})
export class PdfViewerDialogComponent {
constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {}
}
