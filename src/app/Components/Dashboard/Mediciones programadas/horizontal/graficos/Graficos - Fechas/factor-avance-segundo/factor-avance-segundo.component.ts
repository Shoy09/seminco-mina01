import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { NgApexchartsModule, ChartComponent, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend } from "ng-apexcharts";
import { MedicionesHorizontal } from "../../../../../../../models/MedicionesHorizontal";
import { Tonelada } from "../../../../../../../models/tonelada";

export type ExtendedSeries = {
  name?: string;
  type?: "line" | "bar" | "area";
  data: (number | null)[];
  yAxisIndex?: number;
};

export type ChartOptions = {
  series: ExtendedSeries[];
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
  selector: 'app-factor-avance-segundo',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance-segundo.component.html',
  styleUrl: './factor-avance-segundo.component.css'
})
export class FactorAvanceSegundoComponent implements OnChanges {
  @Input() datos: MedicionesHorizontal[] = [];
  @Input() toneladas: Tonelada[] = [];
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
          dataLabels: { position: 'top' }
        } as any
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0, 1], // solo en barras de rendimiento
        formatter: (val: number) => val ? val.toFixed(2) : '',
        style: { fontSize: '12px', colors: ['#000'] },
        offsetY: -20
      },
      stroke: {
        width: [0, 0, 4],
        colors: ['#3B82F6', '#10B981', '#FF9800'],
        curve: 'smooth',
        dashArray: [0, 0, 10]
      },
      colors: ['#3B82F6', '#10B981', '#FF9800'],
      fill: { opacity: 1 },
      xaxis: {
        categories: [],
        title: { text: 'Labores' },
        labels: { rotate: -45, style: { fontSize: '10px' } }
      },
      yaxis: [
        {
          // 👈 Eje izquierdo - Valores absolutos
          title: { text: "Kg Explosivo y Toneladas" }, // ← CAMBIADO
          labels: {
            formatter: (val: number) => val.toFixed(2)
          }
        },
        {
          // 👈 Eje derecho - Relación
          opposite: true,
          title: { text: "Relación Kg Explosivo / Toneladas" }, // ← CAMBIADO
          labels: {
            formatter: (val: number) => val.toFixed(2)
          },
          min: 0,
          // 🔹 Quitamos 'max' aquí porque se calculará dinámicamente en updateChart()
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
          fillColors: ['#3B82F6', '#10B981', '#FF9800']
        }
      }
    };
  }

  private updateChart(): void {
    const filtrados = this.datos.filter(d =>
      d.kg_explosivos &&
      d.labor &&
      d.labor.trim().toUpperCase().startsWith("TJ") &&
      (!d.no_aplica || d.no_aplica === 0) &&
      (!d.remanente || d.remanente === 0)
    );

    if (filtrados.length === 0) {
      this.chartOptions.series = [];
      return;
    }

    // 🔹 Agrupar datos por labor
    const agrupados = filtrados.reduce((acc, d) => {
      const labor = d.labor || 'SIN LABOR';
      if (!acc[labor]) {
        acc[labor] = { kg_explosivos: 0, toneladas: 0, count: 0,};
      }

      acc[labor].kg_explosivos += d.kg_explosivos || 0;

      // Buscar tonelada correspondiente
      const t = this.toneladas.find(
        ton => ton.fecha === d.fechaAjustada && ton.zona === d.zona && ton.labor === d.labor
      );
      acc[labor].toneladas += t ? t.toneladas : 0;

      acc[labor].count += 1;
      return acc;
    }, {} as Record<string, { kg_explosivos: number; toneladas: number; count: number; zona?: string }>);

    // 🔹 Convertir a arrays para el gráfico
    const categories = Object.keys(agrupados);
    const kgExplosivo = categories.map(l => agrupados[l].kg_explosivos);
    const toneladasSeries = categories.map(l => agrupados[l].toneladas);
    const kgPorTonelada = categories.map(l =>
      agrupados[l].toneladas > 0 ? agrupados[l].kg_explosivos / agrupados[l].toneladas : 0
    );

    // 🔹 Calcular promedios globales
    const totalKg = Object.values(agrupados).reduce((sum, d) => sum + d.kg_explosivos, 0);
    const totalTon = Object.values(agrupados).reduce((sum, d) => sum + d.toneladas, 0);

    const promedioKg = kgExplosivo.length > 0 ? totalKg / kgExplosivo.length : 0;
    const promedioToneladas = toneladasSeries.length > 0 ? totalTon / toneladasSeries.length : 0;
    const promedioKgPorTonelada = totalTon > 0 ? totalKg / totalTon : 0;

    // 🔹 Agregar barra de promedio
    categories.push('PROMEDIO');
    kgExplosivo.push(Number(promedioKg.toFixed(2)));
    toneladasSeries.push(Number(promedioToneladas.toFixed(2)));
    kgPorTonelada.push(Number(promedioKgPorTonelada.toFixed(2)));

    // 🔹 CALCULAR MÁXIMO DINÁMICO PARA EL EJE DERECHO (NUEVO)
    const valoresRelacion = kgPorTonelada.filter(val => val !== null && val !== undefined) as number[];
    const maxRelacion = valoresRelacion.length > 0 ? Math.max(...valoresRelacion) : 1;
    const maxEje = Math.max(maxRelacion * 1.2, 0.5); // mínimo 0.5 para evitar ejes muy pequeños

    // 🔹 CORREGIR ASIGNACIÓN DE EJES EN LAS SERIES
    // Toneladas debe ir en el eje izquierdo (0), no en el derecho (1)
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: "Kg Explosivo",
          type: "bar",
          data: kgExplosivo,
          yAxisIndex: 0  // ← Eje izquierdo
        },
        {
          name: "Toneladas",
          type: "bar",
          data: toneladasSeries,
          yAxisIndex: 0  // ← Eje izquierdo (CORREGIDO: antes estaba en 1)
        },
        {
          name: "Kg Explosivo/Toneladas",
          type: "line",
          data: kgPorTonelada,
          yAxisIndex: 1  // ← Eje derecho
        }
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories
      },
      yaxis: [ // ← NUEVO: Incluir configuración completa de ejes
        {
          title: { text: "Kg Explosivo y Toneladas" },
          labels: { formatter: (val: number) => val.toFixed(2) }
        },
        {
          opposite: true,
          title: { text: "Relación Kg Explosivo / Toneladas" },
          labels: { formatter: (val: number) => val.toFixed(2) },
          min: 0,
          max: maxEje, // ← NUEVO: máximo dinámico
          tickAmount: 4
        }
      ]
    };

    // 🔹 Refrescar gráfico
    setTimeout(() => {
      if (this.chart && this.chart.updateOptions) {
        this.chart.updateOptions(this.chartOptions);
      }
    }, 100);
  }
}