import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip-labor',
  imports: [CommonModule],
  templateUrl: './tooltip-labor.component.html',
  styleUrl: './tooltip-labor.component.css'
})
export class TooltipLaborComponent {
  @Input() labor: any;
  @Input() x: number = 0;
  @Input() y: number = 0;

  get porcentajeSobreExcavacion(): number | null {
    if (!this.labor) return null;

    const alto = Number(this.labor.alto ?? 0);
    const ancho = Number(this.labor.ancho ?? 0);
    const altoReal = Number(this.labor.altoReal ?? 0);
    const anchoReal = Number(this.labor.anchoReal ?? 0);

    const seccionProgramada = alto * ancho;
    const seccionEjecutada = altoReal * anchoReal;

    // evitamos división entre 0 o datos inválidos
    if (seccionEjecutada <= 0 || seccionProgramada <= 0) {
      return null;
    }

    const ratio = seccionProgramada / seccionEjecutada;
    const sobreExcavacion = 1 - ratio;

    // Lo convertimos a porcentaje (ej: 0.18 -> 18)
    return sobreExcavacion * 100;
  }
}
