import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { MedicionesHorizontal } from '../../../../../../../models/MedicionesHorizontal';

interface ExtendedSeries {
  name?: string;
  type?: "line" | "bar" | "area";
  data: (number | null)[];
  yAxisIndex?: number;
}

interface ChartOptions {
  series: ExtendedSeries[];
  chart: any;
  dataLabels: any;
  plotOptions: any;
  yaxis: any;
  xaxis: any;
  fill: any;
  tooltip: any;
  stroke: any;
  legend: any;
  colors?: string[];
}

@Component({
  selector: 'app-factor-avance-semana',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance-semana.component.html',
  styleUrl: './factor-avance-semana.component.css'
})
export class FactorAvanceSemanaComponent implements OnChanges, OnInit {
  @Input() datos: MedicionesHorizontal[] = [];
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;
  private hasInitialized = false;

  constructor() {
    this.chartOptions = this.getEmptyOptions();
  }

  ngOnInit() {
    this.hasInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      setTimeout(() => this.updateChart(), 50);
    }
  }

  private getEmptyOptions(): ChartOptions {
    return {
      series: [{ name: "Rendimiento (Kg/m)", type: "bar", data: [], yAxisIndex: 0 }, 
               { name: "Avance Programado (m)", type: "line", data: [], yAxisIndex: 1 }],
      chart: { type: "line", height: 400, stacked: false, toolbar: { show: true }, zoom: { enabled: false }, animations: { enabled: false } },
      plotOptions: { bar: { horizontal: false, borderRadius: 5, endingShape: "rounded", dataLabels: { position: 'top' } } },
      dataLabels: { enabled: false, enabledOnSeries: [0], formatter: (val: number) => val ? val.toFixed(2) : '', 
                    style: { fontSize: '12px', colors: ['#000'] }, offsetY: -20 },
      stroke: { width: [0, 4], colors: [undefined, '#BF4342'], curve: 'smooth' },
      colors: ['#3B82F6', '#BF4342'],
      fill: { opacity: 1, colors: ['#3B82F6'] },
      xaxis: { categories: [], title: { text: 'Labores' }, labels: { rotate: -45, style: { fontSize: '10px' } } },
      yaxis: [
        { seriesName: "Rendimiento (Kg/m)", title: { text: "Rendimiento (Kg/m)" }, labels: { formatter: (val: number) => val ? val.toFixed(2) : '0' }, min: 0 },
        { opposite: true, seriesName: "Avance Programado (m)", title: { text: "Avance Programado (m)" }, 
          labels: { formatter: (val: number) => val ? val.toFixed(2) : '0' }, min: 0, forceNiceScale: false}
      ],
      tooltip: { shared: true, intersect: false, y: { formatter: (val: number) => val ? val.toFixed(2) : '' } },
      legend: { show: true, position: 'top', markers: { fillColors: ['#3B82F6', '#BF4342'] } }
    };
  }

private updateChart(): void {
  if (!this.hasInitialized) return;

  const filtrados = this.datos.filter(d => {
    const kg = d?.kg_explosivos ?? 0;
    const avance = d?.avance_programado ?? 0;
    return kg > 0 && avance > 0 && 
           (!d?.no_aplica || d.no_aplica === 0) && 
           (!d?.remanente || d.remanente === 0);
  });

  if (filtrados.length === 0) {
    this.safeChartUpdate(this.getEmptyOptions());
    return;
  }

  const grupos: { [semana: string]: { kg: number; avance: number; count: number } } = {};
  
  filtrados.forEach(d => {
    const semana = d?.semana?.toString() || "Sin semana";
    grupos[semana] = grupos[semana] || { kg: 0, avance: 0, count: 0 };
    grupos[semana].kg += d?.kg_explosivos ?? 0;
    grupos[semana].avance += d?.avance_programado ?? 0;
    grupos[semana].count += 1;
  });

  const categories: string[] = [];
  const rendimiento: number[] = [];
  const avance: number[] = [];

  Object.keys(grupos).sort().forEach(semana => {
    const grupo = grupos[semana];
    if (grupo.avance > 0 && grupo.count > 0) {
      categories.push(`Semana ${semana}`);
      rendimiento.push(Number((grupo.kg / grupo.avance).toFixed(2)));
      avance.push(Number((grupo.avance / grupo.count).toFixed(2)));
    }
  });

  // 🔹 Calcular PROMEDIO entre semanas
  const numSemanas = categories.length;

  if (numSemanas > 0) {
    const promRendimiento = rendimiento.reduce((s, v) => s + v, 0) / numSemanas;
    const promAvance = avance.reduce((s, v) => s + v, 0) / numSemanas;

    categories.push("PROMEDIO");
    rendimiento.push(Number(promRendimiento.toFixed(2)));
    avance.push(Number(promAvance.toFixed(2)));
  }

  // Validar y ajustar longitudes
  const minLength = Math.min(categories.length, rendimiento.length, avance.length);
  if (minLength === 0) {
    this.safeChartUpdate(this.getEmptyOptions());
    return;
  }

  const finalCategories = categories.slice(0, minLength);
  const finalRendimiento = rendimiento.slice(0, minLength);
  const finalAvance = avance.slice(0, minLength);

  const newOptions: ChartOptions = {
    ...this.getEmptyOptions(),
    series: [
      { name: "Rendimiento (Kg/m)", type: "bar", data: finalRendimiento, yAxisIndex: 0 },
      { name: "Avance Programado (m)", type: "line", data: finalAvance, yAxisIndex: 1 }
    ],
    xaxis: { ...this.getEmptyOptions().xaxis, categories: finalCategories },
    dataLabels: { ...this.getEmptyOptions().dataLabels, enabled: true },
    chart: { ...this.getEmptyOptions().chart, animations: { enabled: true } }
  };

  this.safeChartUpdate(newOptions);
}

  private safeChartUpdate(options: ChartOptions): void {
    this.chartOptions = options;
    
    if (this.chart && typeof this.chart.updateOptions === 'function') {
      try {
        this.chart.updateOptions(options, false, true);
      } catch (err) {
        //console.error("Error updating chart:", err);
      }
    }
  }
}