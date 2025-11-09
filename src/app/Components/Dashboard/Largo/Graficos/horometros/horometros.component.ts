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
  selector: 'app-horometros',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './horometros.component.html',
  styleUrl: './horometros.component.css'
})
export class HorometrosComponent implements OnChanges {
@Input() datosHorometros: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;
  public totalesHorometros: {nombre: string, total: number}[] = [];

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosHorometros'] || changes['metas']) {
      if (this.datosHorometros && this.datosHorometros.length > 0) {
        this.updateChart();
      } else {
        this.chartOptions = this.getDefaultOptions();
        this.totalesHorometros = [];
      }
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
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
            enabled: false
          }
        } as any
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: [1, 1, 1, 3], // Grosor diferente para la línea de meta (el último valor)
        colors: ['#fff', '#fff', '#fff', '#BF4342'] // Color para la línea de meta
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#BF4342'], // Colores para barras + rojo para meta
      fill: {
        opacity: 1
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Equipos',
          style: {
            fontSize: '10px'
          }
        },
        labels: {
          style: {
            fontSize: '10px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Horas Totales',
          style: {
            fontSize: '10px'
          }
        },
        labels: {
          formatter: (value: number) => value.toFixed(1),
          style: {
            fontSize: '10px'
          }
        },
        min: 0
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(2)} horas`
        },
        style: {
          fontSize: '10px'
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '10px',
        itemMargin: {
          horizontal: 5,
          vertical: 2
        },
        markers: {
          fillColors: ['#3B82F6', '#10B981', '#F59E0B', '#BF4342']
        }
      },
      annotations: {
        points: []
      }
    };
  }

  private updateChart(): void {
    if (!this.datosHorometros || this.datosHorometros.length === 0) {
      console.warn('No hay datos para mostrar');
      return;
    }
    
    const processedData = this.processData(this.datosHorometros);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      colors: processedData.colors,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories,
        labels: {
          style: {
            fontSize: '10px',
            fontFamily: 'Arial'
          }
        }
      },
      annotations: {
        points: processedData.annotations
      }
    };
    
    this.totalesHorometros = processedData.totales;
    
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }

  private processData(data: any[]): { 
    series: any[], 
    categories: string[], 
    annotations: any[], 
    colors: string[],
    totales: {nombre: string, total: number}[]
  } {
    const codigosMap = new Map<string, Map<string, number>>();
    const horometrosSet = new Set<string>();
    const totalesMap = new Map<string, number>();
    const annotations: any[] = [];
    const metaMap = new Map<string, number>();
  
    // Procesar metas primero
    this.metas.forEach(meta => {
      metaMap.set(meta.nombre, meta.objetivo);
    });
  
    // Procesar datos de horómetros
    data.forEach(item => {
      const codigo = item.codigo;
      const horometro = item.nombreHorometro;
      const diferencia = item.diferencia;
  
      // Acumular total por horómetro
      const totalActual = totalesMap.get(horometro) || 0;
      totalesMap.set(horometro, totalActual + diferencia); 
  
      // Agregar horómetro al conjunto
      horometrosSet.add(horometro);
  
      if (!codigosMap.has(codigo)) {
        codigosMap.set(codigo, new Map<string, number>());
      }
  
      const horometrosDelCodigo = codigosMap.get(codigo)!;
      const acumulado = horometrosDelCodigo.get(horometro) || 0;
      horometrosDelCodigo.set(horometro, acumulado + diferencia);
    });
  
    // Preparar los totales para mostrar
    const totales = Array.from(totalesMap.entries()).map(([nombre, total]) => ({
      nombre,
      total: parseFloat(total.toFixed(2))
    }));
  
    // Ordenar los horómetros por nombre para consistencia
    const horometros = Array.from(horometrosSet).sort();
    const codigos = Array.from(codigosMap.keys()).sort();
  
    // Crear series para cada horómetro
    const barSeries = horometros.map(horometro => {
      const data = codigos.map(codigo => {
        const horometrosDelCodigo = codigosMap.get(codigo)!;
        return horometrosDelCodigo.get(horometro) || 0;
      });
  
      return {
        name: horometro,
        type: "bar",
        data: data
      };
    });
  
    // Agregar serie de meta (DEBE SER LA ÚLTIMA SERIE)
    const metaSeries = {
      name: "Meta",
      type: "line",
      data: codigos.map(codigo => metaMap.get(codigo) || 0)
    };
  
    // Generar colores dinámicamente (colores para barras + rojo para meta)
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', // Colores para barras
      '#BF4342' // Color para meta (rojo)
    ];
  
    // Crear anotaciones para los totales por equipo
    codigos.forEach((codigo, index) => {
      let totalEquipo = 0;
      horometros.forEach(horometro => {
        const horometrosDelCodigo = codigosMap.get(codigo)!;
        totalEquipo += horometrosDelCodigo.get(horometro) || 0;
      });
  
      const metaEquipo = metaMap.get(codigo) || 0;
  
      annotations.push({
        x: codigo,
        y: Math.max(totalEquipo, metaEquipo) + (Math.max(...Array.from(totalesMap.values())) * 0.05),
        label: {
          borderColor: 'transparent',
          style: {
            color: '#000',
            background: 'transparent',
            fontSize: '10px',
            fontWeight: 'bold'
          },
          text: totalEquipo.toFixed(1),
          offsetY: -10
        }
      });
    });
  
    return {
      series: [...barSeries, metaSeries], // Meta debe ser la última serie
      categories: codigos,
      annotations: annotations,
      colors: colors,
      totales: totales
    };
  }
}