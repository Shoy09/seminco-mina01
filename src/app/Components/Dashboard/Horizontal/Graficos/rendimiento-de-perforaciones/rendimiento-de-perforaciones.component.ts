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

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors?: string[];
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

  private rendimientos: {codigo: string, rendimiento: number}[] = [];
  private horasOperativas: {codigo: string, horas_operativas: number}[] = [];
  private metasPorCodigo: { [codigo: string]: number } = {};

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['RendimientoPerforacion'] && this.RendimientoPerforacion) {
      this.rendimientos = this.calcularRendimientoPerforacion();
      this.horasOperativas = this.calcularHorasOperativas();
      this.calcularMetas();
      this.actualizarGrafico();
    }
  }

  private calcularMetas(): void {
    this.metas.forEach(meta => {
      this.metasPorCodigo[meta.nombre] = meta.objetivo;
    });
  }

  private calcularRendimientoPerforacion(): {codigo: string, rendimiento: number}[] {
    const rendimientoPorCodigo: { [codigo: string]: number } = {};

    this.RendimientoPerforacion.forEach(item => {
      if (!rendimientoPorCodigo[item.codigo]) {
        rendimientoPorCodigo[item.codigo] = 0;
      }

      item.perforaciones.forEach((perforacion: any) => {
        const totalTaladros = (perforacion.ntaladro || 0) + (perforacion.ntaladros_rimados || 0);
        const rendimiento = totalTaladros * (perforacion.longitud_perforacion || 0);
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
    const datosCombinados = this.combinarDatos();
    const datosGrafico = this.procesarDatosParaGrafico(datosCombinados);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Rendimiento por hora",
          type: "bar",
          data: datosGrafico.series[0].data
        },
        {
          name: "Meta",
          type: "line",
          data: datosGrafico.categories.map(codigo => this.metasPorCodigo[codigo] || 0)
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: datosGrafico.categories
      }
    };
  }

  private combinarDatos(): {codigo: string, rendimiento: number, horas_operativas: number}[] {
    const mapaCombinado = new Map<string, {rendimiento: number, horas_operativas: number}>();

    this.rendimientos.forEach(item => {
      mapaCombinado.set(item.codigo, {
        rendimiento: item.rendimiento,
        horas_operativas: 0
      });
    });

    this.horasOperativas.forEach(item => {
      const existente = mapaCombinado.get(item.codigo);
      if (existente) {
        existente.horas_operativas = item.horas_operativas;
      }
    });

    return Array.from(mapaCombinado.entries()).map(([codigo, datos]) => ({
      codigo,
      rendimiento: datos.rendimiento,
      horas_operativas: datos.horas_operativas
    }));
  }

  private procesarDatosParaGrafico(datos: any[]): { series: any[], categories: string[] } {
    const datosOrdenados = [...datos].sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      series: [{
        name: "Rendimiento por hora",
        data: datosOrdenados.map(item => {
          const horas = item.horas_operativas || 1;
          return (item.rendimiento / horas);
        })
      }],
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

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
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
        enabledOnSeries: [0],
        formatter: (val: number) => val.toFixed(1),
        style: {
          colors: ['#000'],
          fontSize: '10px',
        },
        background: {
          enabled: false,
          foreColor: '#000',
          padding: 3,
          borderRadius: 2,
          borderWidth: 0,
          opacity: 0.9,
        },
        offsetY: -20,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.45,
        }
      },
      stroke: {
        width: [0, 4],
        colors: [undefined, '#BF4342'],
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'],
      fill: { 
        opacity: 1,
        colors: ['#3B82F6', '#BF4342']
      },
      xaxis: {
        type: 'category',
        categories: [],
        title: { text: 'Equipos' },
        labels: {
          style: {
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        title: { text: "Rendimiento (m/h)" },
        labels: {
          formatter: (val: number) => val.toFixed(1)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(2)} m/h`
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#3B82F6', '#BF4342']
        }
      },
    };
  }
}