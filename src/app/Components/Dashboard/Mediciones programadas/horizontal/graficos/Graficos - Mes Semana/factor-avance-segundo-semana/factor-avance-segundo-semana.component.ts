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
  selector: 'app-factor-avance-segundo-semana',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance-segundo-semana.component.html',
  styleUrl: './factor-avance-segundo-semana.component.css'
})
export class FactorAvanceSegundoSemanaComponent implements OnChanges {
  @Input() datos: MedicionesHorizontal[] = [];
  @Input() toneladas: Tonelada[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['datos'] || changes['toneladas']) && this.datos) {
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
        enabledOnSeries: [0, 1],
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
        title: { text: 'Semanas' },
        labels: { rotate: -45, style: { fontSize: '10px' } }
      },
      yaxis: [
        {
          title: { text: "Kg Explosivos y Toneladas" },
          labels: { formatter: (val: number) => val.toFixed(2) }
        },
        {
          opposite: true,
          title: { text: "Relación Kg Explosivos / Toneladas" },
          min: 0,
          tickAmount: 4
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val: number) => val ? val.toFixed(2) : '' }
      },
      legend: {
        show: true,
        position: 'top',
        markers: { fillColors: ['#3B82F6', '#10B981', '#FF9800'] }
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

  // 🔹 NUEVA ESTRATEGIA: Agrupar primero por combinación única (labor, zona, fecha)
  const datosAgrupadosUnicos = filtrados.reduce((acc, d) => {
    const labor = d.labor || 'SIN LABOR';
    const zona = d.zona || 'SIN ZONA';
    const fecha = d.fechaAjustada || d.fecha || 'SIN FECHA';
    const semana = d?.semana?.toString() || "Sin semana";
    
    // Crear clave única para evitar duplicados de toneladas
    const claveUnica = `${labor}|${zona}|${fecha}`;
    
    if (!acc[claveUnica]) {
      // Buscar tonelada correspondiente
      const toneladaMatch = this.toneladas.find(
        ton => ton.fecha === fecha && 
               ton.zona === zona && 
               ton.labor === labor
      );
      
      acc[claveUnica] = { 
        semana,
        fecha,
        labor,
        zona,
        kg_explosivos: 0, 
        toneladas: toneladaMatch ? toneladaMatch.toneladas : 0
      };
    }

    // Sumar kg explosivos (esto sí se puede sumar de múltiples registros)
    acc[claveUnica].kg_explosivos += d.kg_explosivos || 0;

    return acc;
  }, {} as Record<string, { semana: string; fecha: string; labor: string; zona: string; kg_explosivos: number; toneladas: number }>);

  // 🔹 AHORA agrupar por semana para el gráfico
  const gruposPorSemana: { [semana: string]: { kg: number; toneladas: number; count: number } } = {};

  Object.values(datosAgrupadosUnicos).forEach(item => {
    const semana = item.semana;
    gruposPorSemana[semana] = gruposPorSemana[semana] || { kg: 0, toneladas: 0, count: 0 };
    
    gruposPorSemana[semana].kg += item.kg_explosivos;
    gruposPorSemana[semana].toneladas += item.toneladas; // ✅ Ya no se duplican
    gruposPorSemana[semana].count += 1;
  });

  // 🔹 Resto del código se mantiene igual...
  const categories: string[] = [];
  const kgExplosivos: number[] = [];
  const toneladasSeries: number[] = [];
  const kgPorTonelada: number[] = [];

  Object.keys(gruposPorSemana).sort().forEach(semana => {
    const g = gruposPorSemana[semana];
    if (g.count > 0) {
      categories.push(`Semana ${semana}`);
      kgExplosivos.push(Number((g.kg).toFixed(2)));
      toneladasSeries.push(Number((g.toneladas).toFixed(2)));
      kgPorTonelada.push(
        g.toneladas > 0 ? Number((g.kg / g.toneladas).toFixed(2)) : 0
      );
    }
  });

  // 🔹 Calcular PROMEDIO por semana
  const numSemanas = Object.keys(gruposPorSemana).length;

  if (numSemanas > 0) {
    const totalKg = Object.values(gruposPorSemana).reduce((s, g) => s + g.kg, 0);
    const totalToneladas = Object.values(gruposPorSemana).reduce((s, g) => s + g.toneladas, 0);
    const totalKgPorTonelada = kgPorTonelada.reduce((s, v) => s + v, 0);

    categories.push("PROMEDIO");
    kgExplosivos.push(Number((totalKg / numSemanas).toFixed(2)));
    toneladasSeries.push(Number((totalToneladas / numSemanas).toFixed(2)));
    kgPorTonelada.push(Number((totalKgPorTonelada / numSemanas).toFixed(2)));
  }

  // 🔹 Calcular máximo dinámico para el eje derecho
  const valoresRelacion = kgPorTonelada.filter(val => val !== null && val !== undefined) as number[];
  const maxRelacion = valoresRelacion.length > 0 ? Math.max(...valoresRelacion) : 1;
  const maxEje = Math.max(maxRelacion * 1.2, 0.5);

  // 🔹 Actualizar gráfica
  this.chartOptions = {
    ...this.chartOptions,
    series: [
      { name: "Kg Explosivos", type: "bar", data: kgExplosivos, yAxisIndex: 0 },
      { name: "Toneladas", type: "bar", data: toneladasSeries, yAxisIndex: 0 },
      { name: "Kg Explosivos / Toneladas", type: "line", data: kgPorTonelada, yAxisIndex: 1 }
    ],
    xaxis: { ...this.chartOptions.xaxis, categories },
    yaxis: [
      {
        title: { text: "Kg Explosivos y Toneladas" },
        labels: { formatter: (val: number) => val.toFixed(2) }
      },
      {
        opposite: true,
        title: { text: "Relación Kg Explosivos / Toneladas" },
        labels: { formatter: (val: number) => val.toFixed(2) },
        min: 0,
        max: maxEje,
        tickAmount: 4
      }
    ]
  };

  setTimeout(() => {
    if (this.chart && this.chart.updateOptions) {
      this.chart.updateOptions(this.chartOptions);
    }
  }, 100);
}
}