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
  selector: 'app-malla-instalada-labor',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './malla-instalada-labor.component.html',
  styleUrl: './malla-instalada-labor.component.css'
})
export class MallaInstaladaLaborComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] || changes['metas']) {  // Reaccionar a cambios en ambos inputs
      if (this.datos && this.datos.length > 0) {
        this.updateChart();
      } else {
        this.chartOptions = this.getDefaultOptions();
      }
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
          fontSize: '12px',
          colors: ['#000']  // Color negro para las barras
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],  // 0 para barras, 4 para línea
        colors: [undefined, '#BF4342'],  // Color rojo para la línea
        curve: 'smooth'
      },
      colors: ['#10B981', '#BF4342'],  // Verde para barras, rojo para línea
      fill: {
        opacity: 1,
        colors: ['#10B981']  // Solo aplica a barras
      },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
        labels: {
          rotate: -45,            // Rotar etiquetas en ángulo
          trim: false,            // No recortar etiquetas
          hideOverlappingLabels: false,  // Forzar visibilidad
          style: {
            fontSize: '12px'
          }
        }
      },      
      yaxis: {
        title: { text: "Mallas Instaladas" },
        labels: {
          formatter: (val: number) => val.toFixed(1)
        }
      },
      tooltip: {
        shared: true,  // Mostrar ambas series en el tooltip
        intersect: false,
        y: {
          formatter: (val: number) => `${val} mallas`
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#10B981', '#BF4342']  // Colores de la leyenda
        }
      }
    };
  }

  private updateChart(): void {
    const processedData = this.processData(this.datos);

    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };

    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(processedData.series);
      }
    }, 100);
  }

  // 3. Actualizar processData() para incluir metas
  private processData(data: any[]): { series: any[], categories: string[] } {
    const laborMap = new Map<string, { real: number, meta: number }>();
  
    data.forEach(item => {
      const labor = item.labor;
      const malla = Number(item.malla_instalada) || 0;
      
      const valorActual = laborMap.get(labor) || { real: 0, meta: 0 };
      valorActual.real += malla;
      
      // Buscar la meta correspondiente usando el nombre de la labor
      const metaLabor = this.metas.find(m => m.nombre === labor);
      valorActual.meta = metaLabor ? metaLabor.objetivo : 0;

      laborMap.set(labor, valorActual);
    });
  
    const laboresOrdenadas = Array.from(laborMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  
    return {
      series: [
        {
          name: "Mallas Instaladas",
          type: "bar",
          data: laboresOrdenadas.map(([_, valores]) => valores.real)
        },
        {
          name: "Meta",
          type: "line",
          data: laboresOrdenadas.map(([_, valores]) => valores.meta)
        }
      ],
      categories: laboresOrdenadas.map(([labor, _]) => labor)
    };
  }
}