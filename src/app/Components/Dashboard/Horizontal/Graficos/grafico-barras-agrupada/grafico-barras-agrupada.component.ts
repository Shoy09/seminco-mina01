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
import { Meta } from '../../../../../models/meta.model';
import { CommonModule } from '@angular/common';

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
  annotations?: any;
};

@Component({
  selector: 'app-grafico-barras-agrupada',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-barras-agrupada.component.html',
  styleUrl: './grafico-barras-agrupada.component.css'
})
export class GraficoBarrasAgrupadaComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] || changes['metas']) {
      if (this.datos && this.datos.length > 0) {
        this.updateChart();
      } else {
        this.chartOptions = this.getDefaultOptions();
      }
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 350,
        stacked: true, // Barras apiladas
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          endingShape: "rounded",
          columnWidth: '70%',
          dataLabels: {
            enabled: false // Desactivamos las etiquetas individuales
          }
        } as any
      },
      dataLabels: {
        enabled: false // Desactivamos dataLabels globalmente
      },
      stroke: {
        show: true,
        width: [1, 1, 3], // Grosor diferente para barras (1) y línea (3)
        colors: ['#fff', '#fff', '#BF4342'] // Color para la línea de meta
      },
      colors: ['#3B82F6', '#10B981', '#BF4342'], // Azul para taladros, verde para rimados, rojo para meta
      fill: {
        opacity: 1
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Equipos'
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Número de Taladros'
        },
        labels: {
          formatter: (value: number) => value.toFixed(0)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, { seriesIndex }) => {
            if (seriesIndex === 2) {
              return `${val.toFixed(0)} taladros`;
            }
            return `${val.toFixed(0)} taladros`;
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        markers: {
          fillColors: ['#3B82F6', '#10B981', '#BF4342']
        }
      },
      annotations: {
        points: [] // Inicializamos las anotaciones vacías
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories,
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Arial'
          }
        }
      },
      annotations: {
        points: processedData.annotations // Añadimos las anotaciones
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }

  private processData(data: any[]): { series: any[], categories: string[], annotations: any[] } {
    const equiposMap = new Map<string, {taladros: number, rimados: number, meta: number}>();
    const annotations: any[] = [];

    data.forEach(item => {
      const codigo = item.codigo;
      const ntaladro = Number(item.ntaladro) || 0;
      const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;

      const valorActual = equiposMap.get(codigo) || {taladros: 0, rimados: 0, meta: 0};
      valorActual.taladros += ntaladro;
      valorActual.rimados += ntaladrosRimados;
      
      const metaEquipo = this.metas.find(m => m.nombre === codigo);
      valorActual.meta = metaEquipo ? metaEquipo.objetivo : 0;

      equiposMap.set(codigo, valorActual);
    });

    const equiposOrdenados = Array.from(equiposMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    // Creamos las anotaciones para mostrar la suma total
    equiposOrdenados.forEach(([codigo, valores]) => {
      const total = valores.taladros + valores.rimados;
      annotations.push({
        x: codigo,
        y: total,
        label: {
          borderColor: 'transparent',
          style: {
            color: '#000',
            background: 'transparent',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          text: total.toString(),
          offsetY: -10
        }
      });
    });

    return {
      series: [
        {
          name: "Taladros",
          type: "bar",
          data: equiposOrdenados.map(([_, valores]) => valores.taladros)
        },
        {
          name: "Rimados",
          type: "bar",
          data: equiposOrdenados.map(([_, valores]) => valores.rimados)
        },
        {
          name: "Meta",
          type: "line",
          data: equiposOrdenados.map(([_, valores]) => valores.meta)
        }
      ],
      categories: equiposOrdenados.map(([equipo, _]) => equipo),
      annotations: annotations
    };
  }
}