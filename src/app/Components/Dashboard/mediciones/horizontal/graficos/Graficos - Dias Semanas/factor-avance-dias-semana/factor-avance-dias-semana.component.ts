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
  selector: 'app-factor-avance-dias-semana',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './factor-avance-dias-semana.component.html',
  styleUrl: './factor-avance-dias-semana.component.css'
})
export class FactorAvanceDiasSemanaComponent implements OnChanges, OnInit {
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
      xaxis: { categories: [], title: { text: 'Días' }, labels: { rotate: -45, style: { fontSize: '10px' } } },
      yaxis: [
        { seriesName: "Rendimiento (Kg/m)", title: { text: "Rendimiento (Kg/m)" }, labels: { formatter: (val: number) => val ? val.toFixed(2) : '0' }, min: 0 },
        { opposite: true, seriesName: "Avance Programado (m)", title: { text: "Avance Programado (m)" }, 
          labels: { formatter: (val: number) => val ? val.toFixed(2) : '0' }, min: 0 }
      ],
      tooltip: { shared: true, intersect: false, y: { formatter: (val: number) => val ? val.toFixed(2) : '' } },
      legend: { show: true, position: 'top', markers: { fillColors: ['#3B82F6', '#BF4342'] } }
    };
  }

  private formatDateToDDMMMYY(dateString: string): string {
    // Ajustar para zona horaria de Perú (UTC-5)
    const date = new Date(dateString + 'T00:00:00-05:00');
    const day = date.getDate();
    const month = date.toLocaleString('es-PE', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month.toLowerCase()}-${year}`;
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

    console.log("📊 Datos filtrados válidos:", filtrados.length);

    if (filtrados.length === 0) {
      this.safeChartUpdate(this.getEmptyOptions());
      return;
    }

    const grupos: { [fecha: string]: { kg: number; avance: number; count: number } } = {};
    
    filtrados.forEach(d => {
      const fecha = d?.fecha || "Sin fecha";
      grupos[fecha] = grupos[fecha] || { kg: 0, avance: 0, count: 0 };
      grupos[fecha].kg += d?.kg_explosivos ?? 0;
      grupos[fecha].avance += d?.avance_programado ?? 0;
      grupos[fecha].count += 1;
    });

    console.log("📦 Grupos por fecha:", grupos);

    const categories: string[] = [];
    const rendimiento: number[] = [];
    const avance: number[] = [];

    const fechasOrdenadas = Object.keys(grupos).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    fechasOrdenadas.forEach(fecha => {
      const grupo = grupos[fecha];
      if (grupo.avance > 0 && grupo.count > 0) {
        const calculoRendimiento = grupo.kg / grupo.avance;
        const calculoAvance = grupo.avance / grupo.count;
        
        console.log(`🔢 Fecha ${fecha}:`);
        console.log(`   KG Total: ${grupo.kg}`);
        console.log(`   Avance Total: ${grupo.avance}`);
        console.log(`   Count: ${grupo.count}`);
        console.log(`   Rendimiento: ${grupo.kg} / ${grupo.avance} = ${calculoRendimiento.toFixed(2)} Kg/m`);
        console.log(`   Avance Promedio: ${grupo.avance} / ${grupo.count} = ${calculoAvance.toFixed(2)} m`);
        console.log('---');

        categories.push(this.formatDateToDDMMMYY(fecha));
        rendimiento.push(Number(calculoRendimiento.toFixed(2)));
        avance.push(Number(calculoAvance.toFixed(2)));
      }
    });

    // CALCULAR PROMEDIOS BASADOS EN DÍAS (BARRAS), NO EN REGISTROS
    if (categories.length > 0) {
      // Sumar los valores de rendimiento y avance de todos los días
      const sumaRendimiento = rendimiento.reduce((sum, val) => sum + val, 0);
      const sumaAvance = avance.reduce((sum, val) => sum + val, 0);
      
      // Calcular promedios dividiendo por la cantidad de días (no de registros)
      const promedioRend = sumaRendimiento / categories.length;
      const promedioAvance = sumaAvance / categories.length;

      console.log('📊 PROMEDIO GLOBAL (POR DÍAS):');
      console.log(`   Días totales: ${categories.length}`);
      console.log(`   Suma Rendimiento: ${sumaRendimiento.toFixed(2)}`);
      console.log(`   Suma Avance: ${sumaAvance.toFixed(2)}`);
      console.log(`   Rendimiento Promedio: ${sumaRendimiento.toFixed(2)} / ${categories.length} = ${promedioRend.toFixed(2)} Kg/m`);
      console.log(`   Avance Promedio: ${sumaAvance.toFixed(2)} / ${categories.length} = ${promedioAvance.toFixed(2)} m`);
      console.log('---');

      categories.push("PROMEDIO");
      rendimiento.push(Number(promedioRend.toFixed(2)));
      avance.push(Number(promedioAvance.toFixed(2)));
    }

    console.log('📈 RESULTADOS FINALES:');
    console.log('   Categorías:', categories);
    console.log('   Rendimiento (Kg/m):', rendimiento);
    console.log('   Avance Promedio (m):', avance);
    console.log('=====================');

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
        console.error("Error updating chart:", err);
      }
    }
  }
}