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
  markers?: any;
};

@Component({
  selector: 'app-prom-num-taladro-tipo-labor',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './prom-num-taladro-tipo-labor.component.html',
  styleUrls: ['./prom-num-taladro-tipo-labor.component.css']
})
export class PromNumTaladroTipoLaborComponent implements OnChanges {
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
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        } as any
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        formatter: (val: number) => Math.round(val).toString(),
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth',
        colors: [undefined, '#BF4342']
      },
      colors: ['#3B82F6', '#BF4342'],
      fill: {
        opacity: 1,
        colors: ['#3B82F6']
      },
      markers: {
        size: [0, 6]
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Tipo de labor',
          style: {
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Promedio de taladros',
          style: {
            fontSize: '12px'
          }
        },
        labels: {
          formatter: (val: number) => Math.round(val).toString(),
          style: {
            fontSize: '12px'
          }
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
        horizontalAlign: 'center',
        markers: {
          fillColors: ['#3B82F6', '#BF4342']
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

  private processData(data: any[]): { series: any[], categories: string[] } {
    const laborMap = new Map<string, Map<string, { total: number, count: number }>>();

    data.forEach(item => {
      const tipoLabor = item.tipo_labor;
      const labor = item.labor || "Sin labor";
      const totalTaladros = (item.ntaladro || 0) + (item.ntaladros_rimados || 0);

      if (!laborMap.has(tipoLabor)) {
        laborMap.set(tipoLabor, new Map<string, { total: number, count: number }>());
      }

      const laborMapInner = laborMap.get(tipoLabor)!;

      if (!laborMapInner.has(labor)) {
        laborMapInner.set(labor, { total: 0, count: 0 });
      }

      const current = laborMapInner.get(labor)!;
      laborMapInner.set(labor, {
        total: current.total + totalTaladros,
        count: current.count + 1
      });
    });

    const categorias: string[] = [];
    const promedios: number[] = [];
    const metas: number[] = [];

    laborMap.forEach((laborInnerMap, tipoLabor) => {
      laborInnerMap.forEach((value, labor) => {
        const categoria = `${tipoLabor}-${labor}`;
        const promedio = value.total / value.count;
        
        categorias.push(categoria);
        promedios.push(promedio);
        
        const metaEncontrada = this.metas.find(m => 
          m.nombre.trim().toLowerCase() === categoria.trim().toLowerCase()
        );
        metas.push(metaEncontrada ? metaEncontrada.objetivo : 0);
      });
    });

    return {
      series: [
        {
          name: 'Promedio de taladros',
          type: 'bar',
          data: promedios
        },
        {
          name: 'Meta',
          type: 'line',
          data: metas
        }
      ],
      categories: categorias
    };
  }
}