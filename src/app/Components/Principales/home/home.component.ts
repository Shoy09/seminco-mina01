import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  usuario: string = 'Jhoel Dioses!';
  mostrarConfiguraciones: boolean = true;
  mostrarAlerta: boolean = true;

  toggleConfiguraciones() {
    this.mostrarConfiguraciones = !this.mostrarConfiguraciones;
  }

  closeAlert() {
    this.mostrarAlerta = false;
  }
}