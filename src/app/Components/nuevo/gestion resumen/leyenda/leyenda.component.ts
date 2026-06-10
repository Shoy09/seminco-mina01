import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-leyenda',
  imports: [CommonModule],
  templateUrl: './leyenda.component.html',
  styleUrl: './leyenda.component.css'
})
export class LeyendaComponent {

items = [
    { nombre: 'Perforado', color: '#4caf50' },
    { nombre: 'Disparada', color: '#f44336' },
    { nombre: 'Acarreo', color: '#2196f3' },
    { nombre: 'Sostenimiento', color: '#9c27b0' },
  ];
}