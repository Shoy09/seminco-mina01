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
  selector: 'app-promedio-mayas',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './promedio-mayas.component.html',
  styleUrl: './promedio-mayas.component.css'
})
export class PromedioMayasComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = []; 
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public sumaMallas: number = 0;
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
      labels: ["Cumplimiento de Mallas"],
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
    this.sumaMallas = this.calcularSumaMallas();
    this.meta = this.obtenerMeta();
    
    // Calcular porcentaje de cumplimiento
    this.porcentajeCumplimiento = this.meta > 0 
      ? (this.sumaMallas / this.meta) * 100 
      : 0;

    // Determinar color basado en el porcentaje de cumplimiento
    this.chartOptions.colors = this.getColorForPercentage(this.porcentajeCumplimiento);

    this.chartOptions = {
      ...this.chartOptions,
      series: [Math.min(100, this.porcentajeCumplimiento)], // Máximo 100% en el gráfico
      labels: [`Cumplimiento: ${Math.min(100, this.porcentajeCumplimiento).toFixed(2)}%`]
    };

    setTimeout(() => {
      if (this.chart?.updateSeries) {
        this.chart.updateSeries([Math.min(100, this.porcentajeCumplimiento)]);
      }
    }, 100);
  }

  private getColorForPercentage(percentage: number): string[] {
    if (percentage >= 100) return ['#00FF00']; // Verde
    if (percentage >= 90) return ['#FFA500'];  // Naranja
    return ['#FF0000']; // Rojo
  }

  private calcularSumaMallas(): number {
    if (!this.datos) return 0;
    
    return this.datos.reduce((total, item) => {
      const mallas = Number(item.malla_instalada) || 0;
      return total + mallas;
    }, 0);
  }

  public obtenerMeta(): number {
    // Asumimos que hay una sola meta global para mallas
    return this.metas.length > 0 ? this.metas[0].objetivo : 0;
  }
}