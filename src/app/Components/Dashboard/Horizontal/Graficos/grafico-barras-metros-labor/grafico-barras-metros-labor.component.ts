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
  selector: 'app-grafico-barras-metros-labor',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-barras-metros-labor.component.html',
  styleUrl: './grafico-barras-metros-labor.component.css'
})
export class GraficoBarrasMetrosLaborComponent implements OnChanges {
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
              : `${val.toFixed(1)} metros (meta)`;
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
    const laboresMap = new Map<string, {real: number, meta: number}>();

    data.forEach(item => {
      const clave = `${item.tipo_labor}-${item.labor}`;
      const longitud = item.longitud_perforacion || 0;

      const valorActual = laboresMap.get(clave) || {real: 0, meta: 0};
      valorActual.real += longitud;
      
      // Buscar la meta correspondiente usando el nombre de la labor
      const metaLabor = this.metas.find(m => m.nombre === clave);
      valorActual.meta = metaLabor ? metaLabor.objetivo : 0; // Meta será 0 si no está definida

      laboresMap.set(clave, valorActual);
    });

    const laboresOrdenadas = Array.from(laboresMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      series: [
        {
          name: "Real",
          type: "bar",
          data: laboresOrdenadas.map(([_, valores]) => Number(valores.real.toFixed(2)))
        },
        {
          name: "Meta",
          type: "line",
          data: laboresOrdenadas.map(([_, valores]) => Number(valores.meta.toFixed(2)))
        }
      ],
      categories: laboresOrdenadas.map(([clave, _]) => clave)
    };
  }
}