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
  yaxis: ApexYAxis | ApexYAxis[];  // ¡Ahora soporta múltiples ejes Y!
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors?: string[];  // Para personalizar colores
};

@Component({
  selector: 'app-grafico-barras',
  standalone: true, 
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './grafico-barras.component.html',
  styleUrls: ['./grafico-barras.component.css']
})
export class GraficoBarrasComponent implements OnChanges { 
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos']) {
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
        enabledOnSeries: [0],  // Solo habilita para barras (serie 0)
        formatter: (val: number) => val.toFixed(1),  // Formato simple para barras
        style: {
          colors: ['#000'],  // Solo color negro para barras
          fontSize: '10px',
        },
        background: {
          enabled: false,
          foreColor: '#000',
          padding: 3,
          borderRadius: 2,
          borderWidth: 0,
          opacity: 0.9,
        },
        offsetY: -20,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.45,
        }
      },
      stroke: {
        width: [0, 4],
        colors: [undefined, '#BF4342'], // Solo define color para la línea
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'], // Azul para barras, rojo para línea
      fill: { 
        opacity: 1,
        colors: ['#3B82F6', '#BF4342']
      },
      xaxis: {
        type: 'category',
        categories: [],
        title: { text: 'Equipos' },
        labels: {
          style: {
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        },
        tooltip: {
          enabled: false
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
          fillColors: ['#3B82F6', '#BF4342']  // Asegura que los colores de la leyenda coincidan
        }
      },
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
    
    // Forzar actualización si es necesario
    setTimeout(() => {
      if (this.chart && this.chart.updateSeries) {
        this.chart.updateSeries(processedData.series);
      }
    }, 100);
}

private processData(data: any[]): { series: any[], categories: string[] } {
  const codigosMap = new Map<string, {real: number, meta: number}>();

  data.forEach(item => {
    const codigo = item.codigo;
    const ntaladro = Number(item.ntaladro) || 0;
    const ntaladrosRimados = Number(item.ntaladros_rimados) || 0;
    const longitud = Number(item.longitud_perforacion) || 0;

    const resultado = (ntaladro + ntaladrosRimados) * longitud;

    const valorActual = codigosMap.get(codigo) || {real: 0, meta: 0};
    valorActual.real += resultado;
    
    // Buscar la meta correspondiente usando el nombre (que equivale al código)
    const metaEquipo = this.metas.find(m => m.nombre === codigo);
    valorActual.meta = metaEquipo ? metaEquipo.objetivo : 0; // Meta será 0 si no está definida

    codigosMap.set(codigo, valorActual);
  });

  const codigosOrdenados = Array.from(codigosMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));

  return {
    series: [
      {
        name: "Real",
        type: "bar",
        data: codigosOrdenados.map(([_, valores]) => Number(valores.real.toFixed(2)))
      },
      {
        name: "Meta",
        type: "line",
        data: codigosOrdenados.map(([_, valores]) => Number(valores.meta.toFixed(2)))
      }
    ],
    categories: codigosOrdenados.map(([codigo, _]) => codigo)
  };
}

}