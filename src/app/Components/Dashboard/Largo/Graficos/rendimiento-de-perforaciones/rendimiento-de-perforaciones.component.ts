import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { Meta } from '../../../../../models/meta.model';

// 1. Actualizar el tipo ChartOptions para soportar series mixtas
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis | ApexYAxis[];  // Soporte para múltiples ejes Y
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors?: string[];  // Para personalizar colores
};

@Component({
  selector: 'app-rendimiento-de-perforaciones',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './rendimiento-de-perforaciones.component.html',
  styleUrls: ['./rendimiento-de-perforaciones.component.css']
})
export class RendimientoDePerforacionesComponent implements OnChanges {
  @Input() RendimientoPerforacion: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent; 
  public chartOptions: ChartOptions;

  // Datos calculados
  private rendimientos: {codigo: string, rendimiento: number}[] = [];
  private horasOperativas: {codigo: string, horas_operativas: number}[] = [];

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['RendimientoPerforacion'] || changes['metas']) && this.RendimientoPerforacion) {
      // 1. Cálculo de rendimiento
      this.rendimientos = this.calcularRendimientoPerforacion();
      
      // 2. Cálculo de horas operativas
      this.horasOperativas = this.calcularHorasOperativas();
      
      // 3. Calcular rendimiento por hora y actualizar gráfico
      this.actualizarGrafico();
    }
  }

  // 2. Actualizar getDefaultOptions() para series mixtas
  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",  // Tipo base (las series pueden sobrescribirlo)
        height: 350,
        stacked: false,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          dataLabels: {
            position: 'top'
          }
        } as any
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],  // Solo habilitar para barras (serie 0)
        formatter: (val: number) => val.toFixed(1),
        style: {
          colors: ['#000'],  // Color negro para las barras
          fontSize: '12px'
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],  // 0 para barras, 4 para línea
        colors: [undefined, '#BF4342'],  // Color rojo para la línea
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'],  // Azul para barras, rojo para línea
      fill: {
        opacity: 1,
        colors: ['#3B82F6']  // Solo aplica a barras
      },
      xaxis: {
        categories: [],
        title: { text: 'Equipos' },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: { text: "Rendimiento (m/h)" },
        labels: {
          formatter: (val: number) => val.toFixed(1)
        }
      },
      tooltip: {
        shared: true,  // Mostrar ambas series en el tooltip
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(2)} m/h`
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#3B82F6', '#BF4342']  // Colores de la leyenda
        }
      }
    };
  }

  private calcularRendimientoPerforacion(): {codigo: string, rendimiento: number}[] {
    const rendimientoPorCodigo: { [codigo: string]: number } = {};
  
    this.RendimientoPerforacion.forEach(item => {
      if (!rendimientoPorCodigo[item.codigo]) {
        rendimientoPorCodigo[item.codigo] = 0;
      }
  
      item.perforaciones.forEach((perforacion: any) => {
        const rendimiento = (perforacion.ntaladro || 0) * (perforacion.longitud_perforacion || 0);
        rendimientoPorCodigo[item.codigo] += rendimiento;
      });
    });
  
    return Object.entries(rendimientoPorCodigo).map(([codigo, total]) => ({
      codigo,
      rendimiento: total
    }));
  }

  private calcularHorasOperativas(): {codigo: string, horas_operativas: number}[] {
    const horasPorCodigo: Record<string, number> = {};
    const estadosProcesados = new Set<string>();

    this.RendimientoPerforacion.forEach(item => {
      if (!horasPorCodigo[item.codigo]) {
        horasPorCodigo[item.codigo] = 0;
      }

      const estadosOperativos = (item.estados || []).filter(
        (estado: any) =>
          estado.estado === 'OPERATIVO' &&
          estado.hora_inicio &&
          estado.hora_final
      );

      estadosOperativos.forEach((estado: any) => {
        const key = `${item.codigo}_${estado.hora_inicio}_${estado.hora_final}`;
        if (!estadosProcesados.has(key)) {
          const diff = this.calcularDiferenciaHoras(estado.hora_inicio, estado.hora_final);
          horasPorCodigo[item.codigo] += diff;
          estadosProcesados.add(key);
        }
      });
    });

    return Object.entries(horasPorCodigo).map(
      ([codigo, totalHoras]) => ({
        codigo,
        horas_operativas: totalHoras
      })
    );
  }

  private actualizarGrafico(): void {
    // Combinar rendimientos y horas operativas por código
    const datosCombinados = this.combinarDatos();
    
    // Procesar datos para el gráfico
    const datosGrafico = this.procesarDatosParaGrafico(datosCombinados);
    
    // Actualizar opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: datosGrafico.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: datosGrafico.categories
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(datosGrafico.series);
      }
    }, 100);
  }

  private combinarDatos(): {codigo: string, rendimiento: number, horas_operativas: number, meta: number}[] {
    const mapaCombinado = new Map<string, {rendimiento: number, horas_operativas: number, meta: number}>();

    // Agregar rendimientos
    this.rendimientos.forEach(item => {
      mapaCombinado.set(item.codigo, {
        rendimiento: item.rendimiento,
        horas_operativas: 0, // Inicializar horas
        meta: 0 // Inicializar meta
      });
    });

    // Agregar horas operativas
    this.horasOperativas.forEach(item => {
      const existente = mapaCombinado.get(item.codigo);
      if (existente) {
        existente.horas_operativas = item.horas_operativas;
      }
    });

    // Agregar metas
    this.metas.forEach(meta => {
      const existente = mapaCombinado.get(meta.nombre);
      if (existente) {
        existente.meta = meta.objetivo;
      }
    });

    // Convertir a array
    return Array.from(mapaCombinado.entries()).map(([codigo, datos]) => ({
      codigo,
      rendimiento: datos.rendimiento,
      horas_operativas: datos.horas_operativas,
      meta: datos.meta
    }));
  }

  // 3. Actualizar processData() para incluir metas
  private procesarDatosParaGrafico(datos: any[]): { series: any[], categories: string[] } {
    // Ordenar por código
    const datosOrdenados = [...datos].sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      series: [
        {
          name: "Rendimiento real",
          type: "bar",
          data: datosOrdenados.map(item => {
            // Calcular rendimiento por hora (evitar división por cero)
            const horas = item.horas_operativas || 1;
            return (item.rendimiento / horas);
          })
        },
        {
          name: "Meta de rendimiento",
          type: "line",
          data: datosOrdenados.map(item => item.meta) // Usar valor directo de la meta
        }
      ],
      categories: datosOrdenados.map(item => item.codigo)
    };
  }

  private calcularDiferenciaHoras(horaInicio: string, horaFinal: string): number {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFinal.split(':').map(Number);

    if (
      hIni < 0 || hIni >= 24 || mIni < 0 || mIni >= 60 ||
      hFin < 0 || hFin >= 24 || mFin < 0 || mFin >= 60
    ) {
      console.error('Formato de hora inválido');
      return 0;
    }

    const totalIni = hIni + mIni / 60;
    const totalFin = hFin + mFin / 60;
    return totalFin >= totalIni
      ? totalFin - totalIni
      : (totalFin + 24) - totalIni;
  }
}