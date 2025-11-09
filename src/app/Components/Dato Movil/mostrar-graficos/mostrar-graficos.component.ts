import { Component, OnInit, ViewChild } from '@angular/core';
import { NubePerforacionHorizontal, NubePerforacionTaladroLargo, NubeSostenimiento } from '../../../models/operaciones.models';
import { CommonModule, DatePipe } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { OperacionService } from '../../../services/OperacionService .service';

// Chart.register(...registerables);

@Component({
  selector: 'app-mostrar-graficos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mostrar-graficos.component.html',
  styleUrls: ['./mostrar-graficos.component.css'],
  providers: [DatePipe], 
})
export class MostrarGraficosComponent implements OnInit {
  @ViewChild('graficoTaladro', { static: false }) graficoTaladro!: any;
  @ViewChild('graficoHorizontal', { static: false }) graficoHorizontal!: any;
  @ViewChild('graficoSostenimiento', { static: false }) graficoSostenimiento!: any;
  @ViewChild('graficoEstadosTaladro', { static: false }) graficoEstadosTaladro!: any;
  @ViewChild('graficoEstadosHorizontal', { static: false }) graficoEstadosHorizontal!: any;
  @ViewChild('graficoEstadosSostenimiento', { static: false }) graficoEstadosSostenimiento!: any;

//   chartTaladro!: Chart | null;
//   chartHorizontal!: Chart | null;
//   chartSostenimiento!: Chart | null;
//   chartEstadosTaladro!: Chart | null;
//   chartEstadosHorizontal!: Chart | null;
//   chartEstadosSostenimiento!: Chart | null;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = 'DÍA';

  // Datos obtenidos
  datosTaladro: any[] = [];
  datosHorizontal: any[] = [];
  datosSostenimiento: any[] = [];

  constructor(
    private operacionService: OperacionService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.operacionService.getOperacionesLargo().subscribe({
      next: data => {
        this.datosTaladro = this.filtrarDatos(data);
        if (this.datosTaladro.length > 0) {
        //   this.crearGraficoTaladro();
        //   this.crearGraficoEstadosTaladro();
        }
      },
      error: error => console.error('Error obteniendo Taladro Largo:', error)
    });
  
    this.operacionService.getOperacionesHorizontal().subscribe({
      next: data => {
        this.datosHorizontal = this.filtrarDatos(data);
        if (this.datosHorizontal.length > 0) {
        //   this.crearGraficoHorizontal();
        //   this.crearGraficoEstadosHorizontal();
        }
      },
      error: error => console.error('Error obteniendo Perforación Horizontal:', error)
    });
  
    this.operacionService.getOperacionesSostenimiento().subscribe({
      next: data => {
        this.datosSostenimiento = this.filtrarDatos(data);
        if (this.datosSostenimiento.length > 0) {
        //   this.crearGraficoSostenimiento();
        //   this.crearGraficoEstadosSostenimiento();
        }
      },
      error: error => console.error('Error obteniendo Sostenimiento:', error)
    });
  }

  filtrarDatos(data: any[]): any[] {
    // Aplicar filtros de fecha y turno
    return data.filter(item => {
      const cumpleFecha = (!this.fechaInicio || item.fecha >= this.fechaInicio) && 
                         (!this.fechaFin || item.fecha <= this.fechaFin);
      const cumpleTurno = !this.turnoSeleccionado || item.turno === this.turnoSeleccionado;
      return cumpleFecha && cumpleTurno;
    });
  }

  // Métodos para crear gráficos de Taladro Largo
//   crearGraficoTaladro(): void {
//     if (this.chartTaladro) {
//       this.chartTaladro.destroy();
//     }

//     const ctx = this.graficoTaladro.nativeElement.getContext('2d');
    
//     // Preparar datos
//     const labels = this.datosTaladro.map(item => 
//       `${item.equipo} - ${this.datePipe.transform(item.fecha, 'shortDate')}`
//     );
    
//     const datosLongitud = this.datosTaladro.map(item => 
//       item.perforaciones?.[0]?.inter_perforaciones?.[0]?.longitud_perforacion || 0
//     );
    
//     const datosTaladros = this.datosTaladro.map(item => 
//       item.perforaciones?.[0]?.inter_perforaciones?.[0]?.ntaladro || 0
//     );

//     this.chartTaladro = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             label: 'Longitud Perforación (m)',
//             data: datosLongitud,
//             backgroundColor: 'rgba(54, 162, 235, 0.7)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1
//           },
//           {
//             label: 'Número de Taladros',
//             data: datosTaladros,
//             backgroundColor: 'rgba(255, 99, 132, 0.7)',
//             borderColor: 'rgba(255, 99, 132, 1)',
//             borderWidth: 1
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Rendimiento de Perforación - Taladros Largos'
//           },
//         },
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });
//   }

//   crearGraficoEstadosTaladro(): void {
//     if (this.chartEstadosTaladro) {
//       this.chartEstadosTaladro.destroy();
//     }

//     const ctx = this.graficoEstadosTaladro.nativeElement.getContext('2d');
    
//     // Calcular tiempo por estado
//     const estados = {
//       OPERATIVO: 0,
//       DEMORA: 0,
//       MANTENIMIENTO: 0,
//       RESERVA: 0,
//       OTROS: 0
//     };

//     this.datosTaladro.forEach(item => {
//       item.estados?.forEach((estado: any) => {
//         const horas = this.calcularHoras(estado.hora_inicio, estado.hora_final || '23:59');
//         if (estado.estado in estados) {
//           estados[estado.estado as keyof typeof estados] += horas;
//         } else {
//           estados.OTROS += horas;
//         }
//       });
//     });

//     const labels = Object.keys(estados).filter(key => estados[key as keyof typeof estados] > 0);
//     const data = labels.map(label => estados[label as keyof typeof estados]);

//     this.chartEstadosTaladro = new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: labels,
//         datasets: [{
//           data: data,
//           backgroundColor: [
//             'rgba(75, 192, 192, 0.7)', // OPERATIVO
//             'rgba(255, 206, 86, 0.7)',  // DEMORA
//             'rgba(255, 99, 132, 0.7)',  // MANTENIMIENTO
//             'rgba(153, 102, 255, 0.7)', // RESERVA
//             'rgba(201, 203, 207, 0.7)'  // OTROS
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Distribución de Estados - Taladros Largos'
//           },
//           tooltip: {
//             callbacks: {
//               label: function(context: any) {
//                 const label = context.label || '';
//                 const value = Number(context.raw) || 0;
//                 const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
//                 const percentage = Math.round((value / total) * 100);
//                 return `${label}: ${value}h (${percentage}%)`;
//               }
//             }
//           }
//         }
//       }
//     });
//   }

//   // Métodos para crear gráficos de Perforación Horizontal
//   crearGraficoHorizontal(): void {
//     if (this.chartHorizontal) {
//       this.chartHorizontal.destroy();
//     }

//     const ctx = this.graficoHorizontal.nativeElement.getContext('2d');
    
//     const labels = this.datosHorizontal.map(item => 
//       `${item.equipo} - ${this.datePipe.transform(item.fecha, 'shortDate')}`
//     );
    
//     const datosLongitud = this.datosHorizontal.map(item => 
//       item.perforaciones_horizontal?.[0]?.inter_perforaciones_horizontal?.[0]?.longitud_perforacion || 0
//     );
    
//     const datosTaladros = this.datosHorizontal.map(item => 
//       item.perforaciones_horizontal?.[0]?.inter_perforaciones_horizontal?.[0]?.ntaladro || 0
//     );

//     this.chartHorizontal = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             label: 'Longitud Perforación (m)',
//             data: datosLongitud,
//             backgroundColor: 'rgba(54, 162, 235, 0.7)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1
//           },
//           {
//             label: 'Número de Taladros',
//             data: datosTaladros,
//             backgroundColor: 'rgba(255, 159, 64, 0.7)',
//             borderColor: 'rgba(255, 159, 64, 1)',
//             borderWidth: 1
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Rendimiento de Perforación - Horizontal'
//           },
//         },
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });
//   }

//   crearGraficoEstadosHorizontal(): void {
//     if (this.chartEstadosHorizontal) {
//       this.chartEstadosHorizontal.destroy();
//     }

//     const ctx = this.graficoEstadosHorizontal.nativeElement.getContext('2d');
    
//     const estados = {
//       OPERATIVO: 0,
//       DEMORA: 0,
//       MANTENIMIENTO: 0,
//       RESERVA: 0,
//       OTROS: 0
//     };

//     this.datosHorizontal.forEach(item => {
//       item.estados?.forEach((estado: any) => {
//         const horas = this.calcularHoras(estado.hora_inicio, estado.hora_final || '23:59');
//         if (estado.estado in estados) {
//           estados[estado.estado as keyof typeof estados] += horas;
//         } else {
//           estados.OTROS += horas;
//         }
//       });
//     });

//     const labels = Object.keys(estados).filter(key => estados[key as keyof typeof estados] > 0);
//     const data = labels.map(label => estados[label as keyof typeof estados]);

//     this.chartEstadosHorizontal = new Chart(ctx, {
//       type: 'doughnut',
//       data: {
//         labels: labels,
//         datasets: [{
//           data: data,
//           backgroundColor: [
//             'rgba(75, 192, 192, 0.7)',
//             'rgba(255, 206, 86, 0.7)',
//             'rgba(255, 99, 132, 0.7)',
//             'rgba(153, 102, 255, 0.7)',
//             'rgba(201, 203, 207, 0.7)'
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Distribución de Estados - Perforación Horizontal'
//           },
//           tooltip: {
//             callbacks: {
//               label: function(context: any) {
//                 const label = context.label || '';
//                 const value = Number(context.raw) || 0;
//                 const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
//                 const percentage = Math.round((value / total) * 100);
//                 return `${label}: ${value}h (${percentage}%)`;
//               }
//             }
//           }
//         }
//       }
//     });
//   }

//   // Métodos para crear gráficos de Sostenimiento
//   crearGraficoSostenimiento(): void {
//     if (this.chartSostenimiento) {
//       this.chartSostenimiento.destroy();
//     }

//     const ctx = this.graficoSostenimiento.nativeElement.getContext('2d');
    
//     const labels = this.datosSostenimiento.map(item => 
//       `${item.equipo} - ${this.datePipe.transform(item.fecha, 'shortDate')}`
//     );
    
//     const datosLongitud = this.datosSostenimiento.map(item => 
//       item.sostenimientos?.[0]?.inter_sostenimientos?.[0]?.longitud_perforacion || 0
//     );
    
//     const datosTaladros = this.datosSostenimiento.map(item => 
//       item.sostenimientos?.[0]?.inter_sostenimientos?.[0]?.ntaladro || 0
//     );

//     this.chartSostenimiento = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             label: 'Longitud Perforación (m)',
//             data: datosLongitud,
//             backgroundColor: 'rgba(54, 162, 235, 0.7)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1
//           },
//           {
//             label: 'Número de Taladros',
//             data: datosTaladros,
//             backgroundColor: 'rgba(75, 192, 192, 0.7)',
//             borderColor: 'rgba(75, 192, 192, 1)',
//             borderWidth: 1
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Rendimiento de Perforación - Sostenimiento'
//           },
//         },
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });
//   }

//   crearGraficoEstadosSostenimiento(): void {
//     if (this.chartEstadosSostenimiento) {
//       this.chartEstadosSostenimiento.destroy();
//     }

//     const ctx = this.graficoEstadosSostenimiento.nativeElement.getContext('2d');
    
//     const estados = {
//       OPERATIVO: 0,
//       DEMORA: 0,
//       MANTENIMIENTO: 0,
//       RESERVA: 0,
//       OTROS: 0
//     };

//     this.datosSostenimiento.forEach(item => {
//       item.estados?.forEach((estado: any) => {
//         const horas = this.calcularHoras(estado.hora_inicio, estado.hora_final || '23:59');
//         if (estado.estado in estados) {
//           estados[estado.estado as keyof typeof estados] += horas;
//         } else {
//           estados.OTROS += horas;
//         }
//       });
//     });

//     const labels = Object.keys(estados).filter(key => estados[key as keyof typeof estados] > 0);
//     const data = labels.map(label => estados[label as keyof typeof estados]);

//     this.chartEstadosSostenimiento = new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: labels,
//         datasets: [{
//           data: data,
//           backgroundColor: [
//             'rgba(75, 192, 192, 0.7)',
//             'rgba(255, 206, 86, 0.7)',
//             'rgba(255, 99, 132, 0.7)',
//             'rgba(153, 102, 255, 0.7)',
//             'rgba(201, 203, 207, 0.7)'
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           title: {
//             display: true,
//             text: 'Distribución de Estados - Sostenimiento'
//           },
//           tooltip: {
//             callbacks: {
//               label: function(context: any) {
//                 const label = context.label || '';
//                 const value = Number(context.raw) || 0;
//                 const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
//                 const percentage = Math.round((value / total) * 100);
//                 return `${label}: ${value}h (${percentage}%)`;
//               }
//             }
//           }
//         }
//       }
//     });
//   }

  // Método auxiliar para calcular horas entre dos tiempos
  calcularHoras(horaInicio: string, horaFin: string): number {
    if (!horaInicio || !horaFin) return 0;
    
    const [hiH, hiM] = horaInicio.split(':').map(Number);
    const [hfH, hfM] = horaFin.split(':').map(Number);
    
    const diffH = hfH - hiH;
    const diffM = hfM - hiM;
    
    return diffH + diffM / 60;
  }

  aplicarFiltros(): void {
    this.obtenerDatos();
  }
}