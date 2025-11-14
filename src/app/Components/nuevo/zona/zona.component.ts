import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ZonaData {
  zona: string;
  labor: string;
  programado: number;
  real: number;
}

@Component({
  selector: 'app-zona',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zona.component.html',
  styleUrl: './zona.component.css'
})
export class ZonaComponent implements OnInit {
  @Input() data: ZonaData[] = [];

  zonasAgrupadas: { nombre: string; labores: ZonaData[] }[] = [];
  expandido: { [zona: string]: boolean } = {};

  ngOnInit(): void {
    const agrupadas: Record<string, ZonaData[]> = {};

    // Agrupar por zona
    this.data.forEach(item => {
      if (!agrupadas[item.zona]) agrupadas[item.zona] = [];
      agrupadas[item.zona].push(item);
    });

    this.zonasAgrupadas = Object.keys(agrupadas).map(nombre => ({
      nombre,
      labores: agrupadas[nombre]
    }));
  }

  toggleExpand(zona: string) {
    this.expandido[zona] = !this.expandido[zona];
  }

  getPorcentaje(real: number, programado: number): number {
    return programado > 0 ? (real / programado) * 100 : 0;
  }

  // 🟦 Nuevo: Calcula resumen de cada zona
  calcularResumen(labores: ZonaData[]) {
    const resumen: Record<string, { real: number; programado: number }> = {};

    labores.forEach(l => {
      if (!resumen[l.labor]) resumen[l.labor] = { real: 0, programado: 0 };
      resumen[l.labor].real += l.real;
      resumen[l.labor].programado += l.programado;
    });

    // Si alguna labor no existe, inicializamos
    ['Ancho', 'Alto', 'Avance'].forEach(key => {
      if (!resumen[key]) resumen[key] = { real: 0, programado: 0 };
    });

    return resumen;
  }
}
