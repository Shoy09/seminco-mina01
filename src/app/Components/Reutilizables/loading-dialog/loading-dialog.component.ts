import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-dialog',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.css'
})
export class LoadingDialogComponent {

}
