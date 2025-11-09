import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexLegend, ApexStroke, ApexXAxis, ApexFill, ApexTooltip, NgApexchartsModule } from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { MedicionesHorizontal } from '../../../../../../../models/MedicionesHorizontal';

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
  selector: 'app-factor-avance',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance.component.html',
  styleUrl: './factor-avance.component.css'
})
export class FactorAvanceComponent implements OnChanges {
  @Input() datos: MedicionesHorizontal[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      this.updateChart();
    }
  }

  private getDefaultOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        type: "bar",
        height: 400,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: true },
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
        enabledOnSeries: [0],
        formatter: (val: number) => val ? val.toFixed(2) : '',
        style: {
          fontSize: '12px',
          colors: ['#000']
        },
        offsetY: -20
      },
      stroke: {
        width: [0, 4],
        colors: [undefined, '#BF4342'],
        curve: 'smooth'
      },
      colors: ['#3B82F6', '#BF4342'],
      fill: {
        opacity: 1,
        colors: ['#3B82F6']
      },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
        labels: {
          rotate: -45,
          style: { fontSize: '10px' }
        }
      },
      yaxis: [
        {
          seriesName: "Rendimiento (Kg/m)",
          title: {
            text: "Rendimiento (Kg/m)"
          },
          labels: {
            formatter: (val: number) => val.toFixed(2)
          }
        },
        {
          opposite: true,
          seriesName: "Avance Programado (m)",
          title: {
            text: "Avance Programado (m)"
          },
          labels: {
            formatter: (val: number) => val.toFixed(2)
          }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => val ? val.toFixed(2) : ''
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
    const filtrados = this.datos.filter(d =>
      d.kg_explosivos && d.avance_programado &&
      (!d.no_aplica || d.no_aplica === 0) &&
      (!d.remanente || d.remanente === 0)
    );

    if (filtrados.length === 0) {
      this.chartOptions.series = [];
      return;
    }

    const categories = filtrados.map(d => d.labor || '');
    const rendimiento = filtrados.map(d =>
      d.avance_programado! > 0 ? (d.kg_explosivos! / d.avance_programado!) : 0
    );
    const avance = filtrados.map(d => d.avance_programado!);

    // Calcular promedios
    const totalKg = filtrados.reduce((sum, d) => sum + (d.kg_explosivos || 0), 0);
    const totalAvance = filtrados.reduce((sum, d) => sum + (d.avance_programado || 0), 0);
    const promedioRendimiento = totalAvance > 0 ? (totalKg / totalAvance) : 0;
    
    // Calcular promedio de avance (promedio simple)
    const promedioAvance = filtrados.length > 0 ? 
      (totalAvance / filtrados.length) : 0;

    // Agregar promedios
    categories.push('PROMEDIO');
    rendimiento.push(Number(promedioRendimiento.toFixed(2)));
    avance.push(Number(promedioAvance.toFixed(2)));

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Rendimiento (Kg/m)",
          type: "bar",
          data: rendimiento
        },
        {
          name: "Avance Programado (m)",
          type: "line",
          data: avance,
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories
      }
    };

    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }
}