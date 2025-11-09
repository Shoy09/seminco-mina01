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
  selector: 'app-suma-metros-perforados',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './suma-metros-perforados.component.html',
  styleUrl: './suma-metros-perforados.component.css'
})
export class SumaMetrosPerforadosComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  
  // Datos públicos para la vista
  public sumaMetros: number = 0;
  public totalTaladros: number = 0;
  public meta: number = 0;
  public porcentajeCumplimiento: number = 0;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['datos'] && this.datos) || changes['metas']) {
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
      labels: ["Cumplimiento de Metros"],
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
    this.sumaMetros = this.calcularSumaMetros();
    this.totalTaladros = this.calcularTotalTaladros();
    this.meta = this.obtenerMeta();
    
    // Calcular porcentaje de cumplimiento
    this.porcentajeCumplimiento = this.meta > 0 
      ? (this.sumaMetros / this.meta) * 100 
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

  private calcularSumaMetros(): number {
    if (!this.datos) return 0;
    
    return this.datos.reduce((total, item) => {
      const ntaladro = Number(item.ntaladro) || 0;
      const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;
      const longitud = Number(item.longitud_perforacion) || 0;
      return total + ((ntaladro + ntaladrosRimados) * longitud);
    }, 0);
  }

  private calcularTotalTaladros(): number {
    if (!this.datos) return 0;
    
    return this.datos.reduce((total, item) => {
      const ntaladro = Number(item.ntaladro) || 0;
      const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;
      return total + ntaladro + ntaladrosRimados;
    }, 0);
  }

  public obtenerMeta(): number {
    return this.metas.length > 0 ? this.metas[0].objetivo : 0;
  }
}