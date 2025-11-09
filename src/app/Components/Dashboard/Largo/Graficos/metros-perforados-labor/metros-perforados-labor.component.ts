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

// 1. Actualizar el tipo ChartOptions
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
  colors?: string[];
};

@Component({
  selector: 'app-metros-perforados-labor',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './metros-perforados-labor.component.html',
  styleUrl: './metros-perforados-labor.component.css'
})
export class MetrosPerforadosLaborComponent implements OnChanges { 
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

  // 2. Actualizar getDefaultOptions()
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
        enabledOnSeries: [0],  // Solo mostrar en las barras
        formatter: (val: number) => val.toFixed(1),
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],  // 0 para barras, 4 para línea
        colors: [undefined, '#BF4342'],  // Rojo para la línea
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'],  // Azul para barras, rojo para línea
      fill: {
        opacity: 1,
        colors: ['#3B82F6']  // Solo aplica a barras
      },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: { text: "Metros perforados" },
        labels: {
          formatter: (val: number) => val.toFixed(1)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(1)} metros`
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
    const laborsMap = new Map<string, { real: number, meta: number }>();

    data.forEach(item => {
      const labor = `${item.tipo_labor}-${item.labor}`;
      const ntaladro = Number(item.ntaladro) || 0;
      const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;
      const longitud = Number(item.longitud_perforacion) || 0;

      const resultado = (ntaladro + ntaladrosRimados) * longitud;

      const valorActual = laborsMap.get(labor) || { real: 0, meta: 0 };
      valorActual.real += resultado;

      // Buscar la meta correspondiente (usando el nombre de la labor)
      const metaLabor = this.metas.find(m => m.nombre === labor);
      valorActual.meta = metaLabor ? metaLabor.objetivo : 0;

      laborsMap.set(labor, valorActual);
    });

    const laborsOrdenados = Array.from(laborsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      series: [
        {
          name: "Real",
          type: "bar",
          data: laborsOrdenados.map(([_, valores]) => valores.real)
        },
        {
          name: "Meta",
          type: "line",
          data: laborsOrdenados.map(([_, valores]) => valores.meta)
        }
      ],
      categories: laborsOrdenados.map(([labor, _]) => labor)
    };
  }
}