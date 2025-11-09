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
  ApexAnnotations,
  NgApexchartsModule
} from "ng-apexcharts";
import { FormsModule } from '@angular/forms';
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
  annotations: ApexAnnotations;
  colors?: string[];
};

export type DataDisplayOption = 'taladros' | 'rimados' | 'ambos';

@Component({
  selector: 'app-grafico-barras-agrupada-num-labor',
  imports: [NgApexchartsModule, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './grafico-barras-agrupada-num-labor.component.html',
  styleUrl: './grafico-barras-agrupada-num-labor.component.css'
})
export class GraficoBarrasAgrupadaNumLaborComponent implements OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];
  @ViewChild("chart") chart!: ChartComponent; 
  public chartOptions: ChartOptions;
  
  // Opciones de visualización
  displayOptions: DataDisplayOption[] = ['taladros', 'rimados', 'ambos'];
  selectedDisplay: DataDisplayOption = 'ambos';

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if (changes['metas']) {
      
    }
  
    if (changes['datos'] || changes['metas']) {
      if (this.datos && this.datos.length > 0) {
        this.updateChart();
      } else {
        this.chartOptions = this.getDefaultOptions();
      }
    }
  }

  onDisplayChange(): void {
    this.updateChart();
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
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
        width: [1, 1, 3], // Grosor diferente para barras (1) y línea (3)
        colors: ['#fff', '#fff', '#BF4342'] // Color para la línea de meta
      },
      colors: ['#4CAF50', '#FF9800', '#BF4342'], // Verde para taladros, naranja para rimados, rojo para meta
      fill: {
        opacity: 1
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Labores'
        },
        labels: {
          formatter: (value: string) => value, // ← Mostrará el valor completo sin procesar
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Cantidad'
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
              return `Meta: ${val.toFixed(0)}`;
            }
            return `${val.toFixed(0)}`;
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        markers: {
          fillColors: ['#4CAF50', '#FF9800', '#BF4342']
        }
      },
      annotations: {
        points: []
      }
    };
  }

  private updateChart(): void {
    if (!this.datos || this.datos.length === 0) {
      return;
    }
    
    const processedData = this.processData(this.datos);
    
    this.chartOptions = {
      ...this.chartOptions,
      series: processedData.series,
      chart: {
        ...this.chartOptions.chart,
        stacked: this.selectedDisplay === 'ambos'
      },
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: processedData.categories
      },
      annotations: {
        points: processedData.annotations
      }
    };
    
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }

  private processData(data: any[]): { series: any[], categories: string[], annotations: any[] } {
    const categorias: string[] = [];
    const taladros: number[] = [];
    const rimados: number[] = [];
    const metas: number[] = [];
    const annotations: any[] = [];

    const agrupado = new Map<string, { ntaladro: number, ntaladros_rimados: number, meta: number }>();

    // Agrupar datos por labor y obtener metas
    data.forEach(item => {
      const laborKey = `${item.tipo_labor}-${item.labor}`;

      if (!agrupado.has(laborKey)) {
        agrupado.set(laborKey, { ntaladro: 0, ntaladros_rimados: 0, meta: 0 });
      }

      const actual = agrupado.get(laborKey)!;
      actual.ntaladro += item.ntaladro || 0;
      actual.ntaladros_rimados += item.ntaladros_rimados || 0;

      // Buscar meta correspondiente
      const metaLabor = this.metas.find(m => 
        m.nombre.trim().toLowerCase() === laborKey.trim().toLowerCase()
      );
      actual.meta = metaLabor ? metaLabor.objetivo : 0;
    });

    // Ordenar y preparar datos según la opción seleccionada
    Array.from(agrupado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([laborKey, valores]) => {
        categorias.push(laborKey);
        
        // Calcular valores según la selección
        let total = 0;
        let showTaladros = false;
        let showRimados = false;

        switch(this.selectedDisplay) {
          case 'taladros':
            total = valores.ntaladro;
            showTaladros = true;
            break;
          case 'rimados':
            total = valores.ntaladros_rimados;
            showRimados = true;
            break;
          case 'ambos':
            total = valores.ntaladro + valores.ntaladros_rimados;
            showTaladros = true;
            showRimados = true;
            break;
        }

        if (showTaladros) taladros.push(valores.ntaladro);
        if (showRimados) rimados.push(valores.ntaladros_rimados);
        metas.push(valores.meta);

        // Configurar anotaciones para mostrar el total
        annotations.push({
          x: laborKey,
          y: total,
          label: {
            text: `${total}`,
            borderColor: 'transparent',
            style: {
              background: 'transparent',
              color: '#000',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: 0
            },
            offsetY: -10
          },
          marker: {
            size: 0,
            fillColor: 'transparent',
            strokeColor: 'transparent'
          }
        });
      });

    // Preparar series según la selección
    const series = [];
    if (this.selectedDisplay === 'taladros' || this.selectedDisplay === 'ambos') {
      series.push({
        name: 'Taladros',
        type: 'bar',
        data: taladros
      });
    }
    if (this.selectedDisplay === 'rimados' || this.selectedDisplay === 'ambos') {
      series.push({
        name: 'Rimados',
        type: 'bar',
        data: rimados
      });
    }
    
    // Agregar serie de meta (siempre visible)
    series.push({
      name: 'Meta',
      type: 'line',
      data: metas
    });

    return {
      categories: categorias,
      series,
      annotations
    };
  }
}