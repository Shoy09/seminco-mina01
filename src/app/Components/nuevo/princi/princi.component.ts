import { Component } from '@angular/core';
import { ZonaComponent } from "../zona/zona.component";
import { LeyendaComponent } from "../leyenda/leyenda.component";
import { CommonModule } from '@angular/common';

interface ZonaData {
  zona: string;
  labor: string;
  programado: number;
  real: number;
}

@Component({
  selector: 'app-princi',
  standalone: true,
  imports: [ZonaComponent, LeyendaComponent, CommonModule],
  templateUrl: './princi.component.html',
  styleUrl: './princi.component.css'
})
export class PrinciComponent {
  zonas: ZonaData[] = [
    { zona: 'GUZZ', labor: 'Labor1', programado: 30, real: 30 },
    { zona: 'GUZZ', labor: 'Labor2', programado: 30, real: 25 },
    { zona: 'SNI125', labor: 'Labor2', programado: 30, real: 20 },
    { zona: 'RAI105', labor: 'Labor3', programado: 20, real: 15 }
  ];

  zonaSeleccionada = 'todas';

  filtrarZonas(): ZonaData[] {
    if (this.zonaSeleccionada === 'todas') return this.zonas;
    return this.zonas.filter(z => z.zona === this.zonaSeleccionada);
  }
}
