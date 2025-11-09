import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-prom-num-taladro-seccion',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './prom-num-taladro-seccion.component.html',
  styleUrls: ['./prom-num-taladro-seccion.component.css']
})
export class PromNumTaladroSeccionComponent implements OnInit {
  @Input() datos: any[] = [];
  
  // Configuración del gráfico de donut
  public chartOptions: any = {
    series: [],
    chart: {
      type: 'donut',
      height: 350,
      toolbar: {
        show: false
      }
    },
    // title: {
    //   text: 'Distribución de Taladros por Sección',
    //   align: 'center',
    //   style: {
    //     fontSize: '16px'
    //   }
    // },
    labels: [],
    colors: [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
      '#546E7A', '#26a69a', '#D10CE8', '#FFA726', '#66BB6A'
    ],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
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
              label: 'Promedio general',
              formatter: () => {
                const total = this.chartOptions.series.reduce((a: number, b: number) => a + b, 0);
                const count = this.chartOptions.series.length;
                return (total / count).toFixed(1);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number, opts: { w: { config: { labels: { [x: string]: string; }; }; }; seriesIndex: string | number; }) {
        return opts.w.config.labels[opts.seriesIndex] + ': ' + val.toFixed(1);
      }
    },
    legend: {
      position: 'right',
      formatter: function(seriesName: string, opts: any) {
        return seriesName + ': ' + opts.w.globals.series[opts.seriesIndex].toFixed(1);
      }
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + ' taladros';
        }
      }
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

    // Agrupar datos por sección
    const seccionMap = new Map<string, { total: number, count: number }>();

    this.datos.forEach(item => {
      const seccion = item.seccion_la_labor;
      const taladros = item.ntaladro || 0;
      
      if (seccionMap.has(seccion)) {
        const current = seccionMap.get(seccion)!;
        seccionMap.set(seccion, {
          total: current.total + taladros,
          count: current.count + 1
        });
      } else {
        seccionMap.set(seccion, {
          total: taladros,
          count: 1
        });
      }
    });

    // Preparar datos para el gráfico
    const labels: string[] = [];
    const promedios: number[] = [];

    seccionMap.forEach((value, key) => {
      labels.push(key);
      promedios.push(value.total / value.count);
    });

    // Actualizar las opciones del gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: promedios,
      labels: labels
    };
  }
}