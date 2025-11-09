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
  colors: string[];
};

@Component({
  selector: 'app-disponibilidad-mecanica-equipo',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './disponibilidad-mecanica-equipo.component.html',
  styleUrl: './disponibilidad-mecanica-equipo.component.css'
})
export class DisponibilidadMecanicaEquipoComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  private metasPorCodigo: { [codigo: string]: number } = {};

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos && this.datos.length > 0) {
      this.calcularMetas();
      this.updateChart();
    } else if (changes['metas']) {
      this.calcularMetas();
      if (this.datos && this.datos.length > 0) {
        this.updateChart();
      }
    } else {
      this.chartOptions = this.getDefaultOptions();
    }
  }

  private calcularMetas(): void {
    this.metasPorCodigo = {};
    this.metas.forEach(meta => {
      this.metasPorCodigo[meta.nombre] = meta.objetivo;
    });
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [
        {
          name: "Disponibilidad Mecánica",
          type: "bar",
          data: []
        },
        {
          name: "Meta",
          type: "line",
          data: []
        }
      ],
      colors: ['#3B82F6', '#BF4342'],
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
          columnWidth: '70%',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0], // Solo habilitar para las barras
        formatter: (val: number) => `${val.toFixed(2)}%`,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#000"]
        },
        background: {
          enabled: false,
          foreColor: '#000',
          padding: 3,
          borderRadius: 2,
          borderWidth: 0,
          opacity: 0.9,
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.45,
        }
      },
      stroke: {
        width: [0, 4], // Sin borde para barras, grosor 4 para línea
        colors: [undefined, '#BF4342'], // Color solo para la línea
        curve: 'smooth'
      },
      xaxis: {
        categories: [],
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        }
      },
      yaxis: {
        min: 0,
        max: 100,
        title: {
          text: 'Disponibilidad (%)',
          style: {
            fontSize: '12px'
          }
        },
        labels: {
          formatter: (val: number) => `${val}%`
        }
      },
      fill: {
        opacity: 1,
        colors: ['#3B82F6', '#BF4342']
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#3B82F6', '#BF4342']
        }
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    // Obtener datos de metas en el mismo orden que las categorías
    const metasData = processedData.categories.map(codigo => 
      this.metasPorCodigo[codigo] || 0
    );
    
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Disponibilidad Mecánica",
          type: "bar",
          data: processedData.disponibilidadMecanica
        },
        {
          name: "Meta",
          type: "line",
          data: metasData
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries([
          {
            name: "Disponibilidad Mecánica",
            type: "bar",
            data: processedData.disponibilidadMecanica
          },
          {
            name: "Meta",
            type: "line",
            data: metasData
          }
        ]);
      }
    }, 100);
  }

  private processData(data: any[]): { 
    categories: string[], 
    disponibilidadMecanica: number[] 
  } {
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
  
    // Obtener operaciones únicas
    const operacionesUnicas = Array.from(new Set(datosConDuracion.map(item => item.codigoOperacion)));
    
    // Calcular disponibilidad mecánica para cada operación
    const disponibilidadMecanica = operacionesUnicas.map(operacion => {
      const itemsOperacion = datosConDuracion.filter(item => item.codigoOperacion === operacion);
      
      // Calcular tiempos por estado
      const tiempoOperativo = this.sumDuracionPorEstado(itemsOperacion, 'OPERATIVO');
      const tiempoDemora = this.sumDuracionPorEstado(itemsOperacion, 'DEMORA');
      const tiempoMantenimiento = this.sumDuracionPorEstado(itemsOperacion, 'MANTENIMIENTO');
      const tiempoReserva = this.sumDuracionPorEstado(itemsOperacion, 'RESERVA');
      const tiempoFueraPlan = this.sumDuracionPorEstado(itemsOperacion, 'FUERA DE PLAN');
      
      // Realizar cálculos según la fórmula
      const tiempoOperativoCalculo = tiempoOperativo + tiempoDemora + tiempoMantenimiento;
      const tiempoDisponible = tiempoOperativoCalculo + tiempoReserva;
      const nominal = tiempoDisponible + tiempoFueraPlan;
      
      // Calcular disponibilidad mecánica
      if (nominal === 0) return 0; // Evitar división por cero
      
      const disponibilidad = ((nominal - tiempoMantenimiento) / nominal) * 100;
      return parseFloat(disponibilidad.toFixed(2));
    });
  
    return {
      categories: operacionesUnicas,
      disponibilidadMecanica: disponibilidadMecanica
    };
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