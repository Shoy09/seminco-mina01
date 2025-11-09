import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent,
  ApexResponsive,
  ApexLegend,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { Meta } from '../../../../../models/meta.model';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  colors: string[];
};

@Component({
  selector: 'app-rendimiento-promedio',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './rendimiento-promedio.component.html',
  styleUrl: './rendimiento-promedio.component.css'
})
export class RendimientoPromedioComponent implements OnChanges { 
  @Input() RendimientoPerforacion: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  
  // Datos públicos para la vista
  public meta: number = 0;
  public rendimientoPromedio: number = 0;
  public horasTotales: number = 0;
  public porcentajeCumplimiento: number = 0;

  constructor() {
    this.chartOptions = this.getDefaultOptions(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['RendimientoPerforacion'] && this.RendimientoPerforacion) || changes['metas']) {
      this.updateChart();
    } else {
      this.chartOptions = this.getDefaultOptions();
    }
  }

  private getDefaultOptions(): Partial<ChartOptions> {
    return {
      series: [0],
      chart: {
        type: "radialBar",
        height: 350,
        offsetY: -20
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: "22px",
              formatter: (val: number) => {
                return `${val.toFixed(2)}%`;
              }
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["Cumplimiento de Rendimiento"],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          }
        }
      }]
    };
  }

  private updateChart(): void {
    // Calcular valores
    this.rendimientoPromedio = this.calcularRendimientoPromedio();
    this.meta = this.obtenerMeta();
    this.horasTotales = this.calcularHorasTotales();
    
    // Calcular porcentaje de cumplimiento
    this.porcentajeCumplimiento = this.meta > 0 
      ? (this.rendimientoPromedio / this.meta) * 100 
      : 0;

    // Configurar el gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: [Math.min(100, this.porcentajeCumplimiento)], // Máximo 100% en el gráfico
      labels: [`Cumplimiento: ${Math.min(100, this.porcentajeCumplimiento).toFixed(2)}%`],
      colors: this.getColorsForPercentage(this.porcentajeCumplimiento)
    };

    // Actualizar el gráfico
    setTimeout(() => {
      if (this.chart?.updateSeries) {
        this.chart.updateSeries([Math.min(100, this.porcentajeCumplimiento)]);
      }
    }, 100);
  }

  private getColorsForPercentage(percentage: number): string[] {
    if (percentage >= 100) return ['#00FF00']; // Verde
    if (percentage >= 90) return ['#FFA500'];  // Naranja
    return ['#FF0000']; // Rojo
  }

  public obtenerMeta(): number {
    return this.metas.length > 0 ? this.metas[this.metas.length - 1].objetivo : 0;
  }

  public calcularRendimientoPromedio(): number {
    const rendimientosPorEquipo = this.calcularRendimientoPerforacion();
    const horasPorEquipo = this.calcularHorasOperativas();

    let rendimientoTotal = 0;
    let equiposValidos = 0;

    rendimientosPorEquipo.forEach(rendimientoItem => {
      const horasItem = horasPorEquipo.find(h => h.codigo === rendimientoItem.codigo);
      if (horasItem && horasItem.horas_operativas > 0) {
        rendimientoTotal += (rendimientoItem.rendimiento / horasItem.horas_operativas);
        equiposValidos++;
      }
    });

    return equiposValidos > 0 ? rendimientoTotal / equiposValidos : 0;
  }

  private calcularHorasTotales(): number {
    const horasPorEquipo = this.calcularHorasOperativas();
    return horasPorEquipo.reduce((total, item) => total + item.horas_operativas, 0);
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