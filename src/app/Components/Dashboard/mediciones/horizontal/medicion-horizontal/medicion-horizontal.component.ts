import { Component, OnInit } from '@angular/core';
import { ExcelMedicionesHorizontalService } from './excel-mediciones-horizontal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicionesHorizontal } from '../../../../../models/MedicionesHorizontal';
import { MedicionesHorizontalService } from '../../../../../services/mediciones-horizontal.service';
import { Tonelada } from '../../../../../models/tonelada';
import { ToneladasService } from '../../../../../services/toneladas.service';
import { FactorAvanceComponent } from '../graficos/Graficos - Fechas/factor-avance/factor-avance.component';
import { FactorAvanceSegundoComponent } from '../graficos/Graficos - Fechas/factor-avance-segundo/factor-avance-segundo.component';
import { FactorAvanceSemanaComponent } from "../graficos/Graficos - Mes Semana/factor-avance-semana/factor-avance-semana.component";
import { FactorAvanceSegundoSemanaComponent } from "../graficos/Graficos - Mes Semana/factor-avance-segundo-semana/factor-avance-segundo-semana.component";
import { FactorAvanceDiasSemanaComponent } from "../graficos/Graficos - Dias Semanas/factor-avance-dias-semana/factor-avance-dias-semana.component";
import { FactorAvanceSegundoDiasSemanaComponent } from "../graficos/Graficos - Dias Semanas/factor-avance-segundo-dias-semana/factor-avance-segundo-dias-semana.component";
import { PdfExportService } from '../pdf-export.service';
import { AuthService } from '../../../../../services/auth-service.service';


@Component({
  selector: 'app-medicion-horizontal',
  templateUrl: './medicion-horizontal.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, FactorAvanceComponent, FactorAvanceSegundoComponent, FactorAvanceSemanaComponent, FactorAvanceSegundoSemanaComponent, FactorAvanceDiasSemanaComponent, FactorAvanceSegundoDiasSemanaComponent],
  styleUrls: ['./medicion-horizontal.component.css']
})
export class MedicionHorizontalComponent implements OnInit {
  datosOperaciones: MedicionesHorizontal[] = [];
  datosOperacionesExport: MedicionesHorizontal[] = [];
  datosOperacionesOriginal: MedicionesHorizontal[] = [];

  fechaDesde: string = '';
  fechaHasta: string = '';
  turnoSeleccionado: string = '';
  turnos: string[] = ['DÍA', 'NOCHE'];

  toneladas: Tonelada[] = [];

  constructor(private pdfService: PdfExportService, private medicionService: MedicionesHorizontalService,
  private excelService: ExcelMedicionesHorizontalService, private toneladasService: ToneladasService, private authService: AuthService ) {}

  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();

    this.obtenerDatos();
    this.obtenerToneladas(); 
  }

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();

    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    } else {
      return 'NOCHE';
    }
  }

  quitarFiltros(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();

    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  aplicarFiltrosLocales(): void {
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  }

  filtrarDatos(datos: MedicionesHorizontal[], filtros: any): MedicionesHorizontal[] {
    return datos.filter(operacion => {
      const fechaOperacion = new Date(operacion.fecha);
      const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
      const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

      if (fechaDesde && fechaOperacion < fechaDesde) return false;
      if (fechaHasta && fechaOperacion > fechaHasta) return false;
      if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) return false;

      return true;
    });
  }

  private obtenerMesesEntreFechas(fechaDesde: Date, fechaHasta: Date): string[] {
  const meses: string[] = [];
  const fechaActual = new Date(fechaDesde);

  while (fechaActual <= fechaHasta) {
    const mes = fechaActual.toLocaleString("es-ES", { month: "long" });
    const año = fechaActual.getFullYear();
    const mesFormato = `${mes} ${año}`;
    if (!meses.includes(mesFormato)) {
      meses.push(mesFormato);
    }
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }

  return meses;
}

// Devuelve la semana ISO de una fecha
private obtenerSemanaISO(fecha: Date): number {
  const temp = new Date(fecha.getTime());
  temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
  const inicioAño = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const semana = Math.ceil((((+temp - +inicioAño) / 86400000) + 1) / 7);
  return semana;
}

// Devuelve todas las semanas ISO entre dos fechas
private obtenerSemanasEntreFechas(fechaDesde: Date, fechaHasta: Date): number[] {
  const semanas: number[] = [];
  const fechaActual = new Date(fechaDesde);

  while (fechaActual <= fechaHasta) {
    const semana = this.obtenerSemanaISO(fechaActual);
    if (!semanas.includes(semana)) {
      semanas.push(semana);
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return semanas;
}



  obtenerDatos(): void {
    this.medicionService.getMediciones().subscribe({
      next: (data: MedicionesHorizontal[]) => {
        
        this.datosOperacionesOriginal = data;
        this.datosOperacionesExport = data;

        const filtros = {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          turnoSeleccionado: this.turnoSeleccionado
        };

        this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
console.log("✅ Datos recibidos del servicio:", data);
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  obtenerToneladas(): void {
    this.toneladasService.getToneladas().subscribe({
      next: (data: Tonelada[]) => {
        this.toneladas = data;
        console.log("📦 Toneladas recibidas:", data);
      },
      error: (err) => {
        console.error("❌ Error al obtener toneladas:", err);
      }
    });
  }

  exportarFiltrado() {
  this.excelService.exportFiltradaToExcel(this.datosOperaciones, 'MedicionesHorizontal');
}

// Exportar toda la data
exportarCompleto() {
  this.excelService.exportCompletaToExcel(this.datosOperacionesExport, 'MedicionesHorizontal');
}

exportarPdf() {
    this.pdfService.exportChartsToPdf([
      'grafico1',
      'grafico2',
      'grafico3',
      'grafico4',
      'grafico5',
      'grafico6'
    ], 'reporte-graficos.pdf');
  }

}
