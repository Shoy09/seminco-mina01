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
  colors?: string[];
};

@Component({
  selector: 'app-barras-metro-perforados-labor',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './barras-metro-perforados-labor.component.html',
  styleUrl: './barras-metro-perforados-labor.component.css'
})
export class BarrasMetroPerforadosLaborComponent implements OnChanges { 
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
        enabledOnSeries: [0], // Solo muestra etiquetas en las barras
        formatter: (val: number) => val.toFixed(1),
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4], // Grosor diferente para barras (0) y línea (4)
        colors: [undefined, '#BF4342'] // Color para la línea
      },
      colors: ['#3B82F6', '#BF4342'], // Azul para barras, rojo para línea
      fill: {
        opacity: 1,
        colors: ['#3B82F6']
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Labores'
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => value.toFixed(1)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, { seriesIndex }) => {
            return seriesIndex === 0 
              ? `${val.toFixed(1)} metros` 
              : `${val.toFixed(1)} metros`;
          }
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
        categories: processedData.categories,
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Arial'
          }
        }
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(processedData.series);
      }
    }, 100);
  }

  private processData(data: any[]): { series: any[], categories: string[] } {
    const laborsMap = new Map<string, {real: number, meta: number}>();

    data.forEach(item => {
      const labor = `${item.tipo_labor}-${item.labor}`;
      const ntaladro = Number(item.ntaladro) || 0;
      const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;
      const longitud = Number(item.longitud_perforacion) || 0;

      const resultado = (ntaladro + ntaladrosRimados) * longitud;

      const valorActual = laborsMap.get(labor) || {real: 0, meta: 0};
      valorActual.real += resultado;
      
      // Buscar la meta correspondiente usando el nombre de la labor
      const metaLabor = this.metas.find(m => m.nombre === labor);
      valorActual.meta = metaLabor ? metaLabor.objetivo : 0; // Meta será 0 si no está definida

      laborsMap.set(labor, valorActual);
    });

    const laborsOrdenados = Array.from(laborsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      series: [
        {
          name: "Real",
          type: "bar",
          data: laborsOrdenados.map(([_, valores]) => Number(valores.real.toFixed(2)))
        },
        {
          name: "Meta",
          type: "line",
          data: laborsOrdenados.map(([_, valores]) => Number(valores.meta.toFixed(2)))
        }
      ],
      categories: laborsOrdenados.map(([labor, _]) => labor)
    };
  }
}