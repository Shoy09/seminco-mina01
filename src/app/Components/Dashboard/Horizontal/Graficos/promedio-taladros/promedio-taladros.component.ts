import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Meta } from '../../../../../models/meta.model';

@Component({
  selector: 'app-promedio-taladros',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './promedio-taladros.component.html',
  styleUrl: './promedio-taladros.component.css'
})
export class PromedioTaladrosComponent implements OnInit, OnChanges {
  @Input() datos: any[] = [];
  @Input() metas: Meta[] = [];

  public chartOptions: any = {
    series: [],
    chart: {
      type: 'donut',
      height: 350
    },
    labels: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total promedio',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return (total / w.globals.series.length).toFixed(2);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff']
      },
      formatter: (val: number, opts: { w: { config: { labels: string[]; }; }; seriesIndex: number; }) => {
        const label = opts.w.config.labels[opts.seriesIndex];
        return `${label}: ${val.toFixed(2)}`;
      }
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      formatter: (seriesName: string, opts: { w: any; seriesIndex: number; }) => {
        const meta = this.metas.find(m => m.nombre === opts.w.config.labels[opts.seriesIndex]);
        const metaValue = meta ? meta.objetivo : 'N/A';
        return `${seriesName}: ${opts.w.config.series[opts.seriesIndex].toFixed(2)} (Meta: ${metaValue})`;
      }
    },
    colors: [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
      '#546E7A', '#26a69a', '#D10CE8', '#FFA726', '#66BB6A'
    ],
    tooltip: {
      y: {
        formatter: (value: number, opts: { seriesIndex: number; dataPointIndex: number; w: any }) => {
          const label = opts.w.config.labels[opts.seriesIndex];
          const meta = this.metas.find(m => m.nombre === label);
          const metaValue = meta ? meta.objetivo : 'N/A';
          return `${value.toFixed(2)} (Meta: ${metaValue})`;
        }
      }
    },
    annotations: {
      yaxis: [],
      xaxis: [],
      points: []
    }
  };

  ngOnInit(): void {
    this.prepareChartData();
  }

  ngOnChanges(): void {
    this.prepareChartData();
  }

  private prepareChartData(): void {
    if (!this.datos || this.datos.length === 0) {
      this.chartOptions.series = [];
      this.chartOptions.labels = [];
      return;
    }

    const seccionesMap = new Map<string, { total: number, count: number }>();

    this.datos.forEach(item => {
      const seccion = item.seccion_la_labor;
      const totalTaladros = (item.ntaladro || 0) + (item.ntaladros_rimados || 0);

      if (seccionesMap.has(seccion)) {
        const current = seccionesMap.get(seccion)!;
        seccionesMap.set(seccion, {
          total: current.total + totalTaladros,
          count: current.count + 1
        });
      } else {
        seccionesMap.set(seccion, {
          total: totalTaladros,
          count: 1
        });
      }
    });

    const labels: string[] = [];
    const series: number[] = [];

    seccionesMap.forEach((value, key) => {
      labels.push(key);
      series.push(parseFloat((value.total / value.count).toFixed(2)));
    });

    this.chartOptions = {
      ...this.chartOptions,
      series: series,
      labels: labels,
    };
  }
}