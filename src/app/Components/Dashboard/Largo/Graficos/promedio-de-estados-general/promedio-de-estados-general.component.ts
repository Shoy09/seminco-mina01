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
  yaxis: ApexYAxis | ApexYAxis[];
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors: string[];
};

@Component({
  selector: 'app-promedio-de-estados-general',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './promedio-de-estados-general.component.html',
  styleUrl: './promedio-de-estados-general.component.css'
})
export class PromedioDeEstadosGeneralComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  // Mapeo de estados a colores
  private coloresPorEstado: { [key: string]: string } = {
    'OPERATIVO': '#4CAF50',        // Verde
    'DEMORA': '#FFEB3B',           // Amarillo
    'MANTENIMIENTO': '#F44336',    // Rojo
    'RESERVA': '#FF9800',          // Naranja
    'FUERA DE PLAN': '#2196F3',    // Azul
  };

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['datos'] || changes['metas']) && this.datos && this.datos.length > 0) {
      this.updateChart();
    } else {
      this.chartOptions = this.getDefaultOptions();
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      colors: [],
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
            position: 'top',
            total: {
              enabled: true,
              style: {
                fontSize: '10px',
                fontWeight: 900
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0], // Solo para las barras
        formatter: (val: number) => val.toFixed(2),
        style: {
          fontSize: '10px',
          colors: ['#000']
        }
      },
      stroke: {
        show: true,
        width: [0, 4], // 0 para barras, 4 para línea
        colors: [undefined, '#BF4342'] // Color rojo para la línea
      },
      xaxis: {
        type: 'category',
        labels: {
          formatter: (value: string) => value
        }
      },
      yaxis: {
        title: { text: "Horas promedio" },
        labels: {
          formatter: (val: number) => val.toFixed(2)
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => val.toFixed(2) + ' horas'
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#4CAF50', '#FFEB3B', '#F44336', '#FF9800', '#2196F3', '#BF4342']
        }
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) return;
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Promedio",
          type: "bar",
          data: processedData.dataPoints.map(point => ({
            x: point.x,
            y: point.y,
            fillColor: point.fillColor
          }))
        },
        {
          name: "Meta",
          type: "line",
          data: processedData.metaPoints
        }
      ],
      colors: processedData.colors,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }

  private processData(data: any[]): { 
    dataPoints: any[], 
    metaPoints: any[], 
    categories: string[], 
    colors: string[] 
  } {
    // Procesar duraciones
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
  
    // Calcular sumas por estado y códigos únicos
    const sumasPorEstado: { [estado: string]: number } = {};
    const codigosUnicos = new Set<string>();
  
    datosConDuracion.forEach(item => {
      const estado = item.estado.toUpperCase();
      codigosUnicos.add(item.codigoOperacion);
      
      sumasPorEstado[estado] = (sumasPorEstado[estado] || 0) + item.duracion;
    });
  
    const totalCodigos = codigosUnicos.size;
    const estados = Object.keys(sumasPorEstado);

    // Preparar datos para el gráfico
    const dataPoints = estados.map(estado => {
      const promedio = totalCodigos > 0 ? sumasPorEstado[estado] / totalCodigos : 0;
      
      return {
        x: estado,
        y: parseFloat(promedio.toFixed(2)),
        fillColor: this.coloresPorEstado[estado] || '#000000'
      };
    });

    // Preparar metas (asumiendo que las metas están por estado)
    const metaPoints = estados.map(estado => {
      const metaEstado = this.metas.find(m => m.nombre === estado);
      return {
        x: estado,
        y: metaEstado ? metaEstado.objetivo : 0
      };
    });
  
    return {
      dataPoints: dataPoints,
      metaPoints: metaPoints,
      categories: estados,
      colors: estados.map(estado => this.coloresPorEstado[estado] || '#000000')
    };
  }

  private parseHora(horaString: string): Date {
    const [horas, minutos] = horaString.split(':').map(Number);
    const date = new Date();
    date.setHours(horas, minutos, 0, 0);
    return date;
  }
}