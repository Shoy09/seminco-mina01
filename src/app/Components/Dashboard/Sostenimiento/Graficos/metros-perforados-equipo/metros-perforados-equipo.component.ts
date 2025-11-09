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

// Actualizado: Soporte para series mixtas y colores personalizados
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis | ApexYAxis[];  // ¡Ahora soporta múltiples ejes Y si es necesario!
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors?: string[];  // Para personalizar colores de series
};


@Component({
  selector: 'app-metros-perforados-equipo',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './metros-perforados-equipo.component.html',
  styleUrl: './metros-perforados-equipo.component.css'
})
export class MetrosPerforadosEquipoComponent implements OnChanges { 
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] || changes['metas']) {  // ¡Ahora también reacciona a cambios en metas!
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
        enabledOnSeries: [0],  // Solo muestra etiquetas en las barras (serie 0)
        formatter: (val: number) => val.toFixed(1),
        style: {
          colors: ['#000'],  // Color negro para las barras
          fontSize: '12px'
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],  // Ancho 0 para barras (serie 0), ancho 4 para línea (serie 1)
        colors: [undefined, '#BF4342'],  // Color rojo para la línea (serie 1)
        curve: 'smooth'  // Línea suavizada
      },
      colors: ['#3B82F6', '#BF4342'],  // Azul para barras, rojo para línea
      fill: {
        opacity: 1,
        colors: ['#3B82F6']  // Solo aplica a barras
      },
      xaxis: {
        categories: [],
        title: { text: 'Equipos' },
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
        shared: true,  // Permite ver ambas series en el tooltip
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(1)} metros`
        }
      },
      legend: {
        show: true,
        position: 'top',
        markers: {
          fillColors: ['#3B82F6', '#BF4342']  // Colores de la leyenda
        }
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) return;
    
    const processedData = this.processData(this.datos);
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      }
    };

    if (this.chart) {
      setTimeout(() => this.chart.updateSeries(processedData.series), 100);
    } 
  }

  private processData(data: any[]): { series: any[], categories: string[] } {
    const codigosMap = new Map<string, { real: number, meta: number }>();

    data.forEach(item => {
      const codigo = item.codigo;
      const ntaladro = Number(item.ntaladro) || 0;
      const longitud = Number(item.longitud_perforacion) || 0;
      const resultado = ntaladro * longitud;

      const valorActual = codigosMap.get(codigo) || { real: 0, meta: 0 };
      valorActual.real += resultado;

      // Buscar la meta correspondiente (usando el nombre/código del equipo)
      const metaEquipo = this.metas.find(m => m.nombre === codigo);
      valorActual.meta = metaEquipo ? metaEquipo.objetivo : 0;

      codigosMap.set(codigo, valorActual);
    });

    const codigosOrdenados = Array.from(codigosMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      series: [
        {
          name: "Real",
          type: "bar",
          data: codigosOrdenados.map(([_, valores]) => valores.real)
        },
        {
          name: "Meta",
          type: "line",
          data: codigosOrdenados.map(([_, valores]) => valores.meta)
        }
      ],
      categories: codigosOrdenados.map(([codigo, _]) => codigo)
    };
  }
}