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
  selector: 'app-disponibilidad-mecanica-general',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './disponibilidad-mecanica-general.component.html',
  styleUrl: './disponibilidad-mecanica-general.component.css'
})
export class DisponibilidadMecanicaGeneralComponent implements OnChanges { 
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public disponibilidad: number = 0;
  public meta: number = 0;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

 ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos && this.datos.length > 0) {
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
      
      labels: ["Disponibilidad Mecánica"],
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
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    this.disponibilidad = this.calcularDisponibilidadGeneral(this.datos);
    this.meta = this.obtenerMeta(); // Asumimos que solo hay una meta

    // Comprobar si la disponibilidad cumple con la meta
    if (this.disponibilidad >= this.meta) {
      this.chartOptions.colors = ['#00FF00'];  // Cambiar color a verde si se cumple la meta
    } else {
      this.chartOptions.colors = ['#FF0000'];  // Cambiar color a rojo si no se cumple
    }

    this.chartOptions = {
      ...this.chartOptions,
      series: [this.disponibilidad],
      labels: [`Disponibilidad: ${this.disponibilidad.toFixed(2)}%`]
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries([this.disponibilidad]);
      }
    }, 100);
  }

  public obtenerMeta(): number {
    return this.metas.length > 0 ? this.metas[0].objetivo : 0;
  }
  

  private calcularDisponibilidadGeneral(data: any[]): number {
    // Calcular duración para cada registro
    const datosConDuracion = data.map(item => {
      const inicio = this.parseHora(item.hora_inicio).getTime();
      const fin = this.parseHora(item.hora_final).getTime();
      let duracionHoras = (fin - inicio) / (1000 * 60 * 60);
      if (duracionHoras < 0) duracionHoras += 24;
  
      return {
        ...item,
        duracion: duracionHoras > 0 ? duracionHoras : 0
      };
    });
    
    // Calcular tiempos por estado para todos los datos
    const tiempoOperativo = this.sumDuracionPorEstado(datosConDuracion, 'OPERATIVO');
    const tiempoDemora = this.sumDuracionPorEstado(datosConDuracion, 'DEMORA');
    const tiempoMantenimiento = this.sumDuracionPorEstado(datosConDuracion, 'MANTENIMIENTO');
    const tiempoReserva = this.sumDuracionPorEstado(datosConDuracion, 'RESERVA');
    const tiempoFueraPlan = this.sumDuracionPorEstado(datosConDuracion, 'FUERA DE PLAN');
    
    // Realizar cálculos según la fórmula
    const tiempoOperativoCalculo = tiempoOperativo + tiempoDemora + tiempoMantenimiento;
    const tiempoDisponible = tiempoOperativoCalculo + tiempoReserva;
    const nominal = tiempoDisponible + tiempoFueraPlan;
    
    // Calcular disponibilidad mecánica
    if (nominal === 0) return 0; // Evitar división por cero
    
    const disponibilidad = ((nominal - tiempoMantenimiento) / nominal) * 100;
    return parseFloat(disponibilidad.toFixed(2));
  }

  private sumDuracionPorEstado(items: any[], estado: string): number {
    return items
      .filter(item => item.estado.toUpperCase() === estado.toUpperCase())
      .reduce((sum, item) => sum + item.duracion, 0);
  }

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}