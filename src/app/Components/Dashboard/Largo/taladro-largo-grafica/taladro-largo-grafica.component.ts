import { Component, OnInit } from '@angular/core';

import { NubeOperacion } from '../../../../models/operaciones.models';
import { NgApexchartsModule } from 'ng-apexcharts';
import { OperacionService } from '../../../../services/OperacionService .service';
import { FormsModule } from '@angular/forms';
import { MetrosPerforadosEquipoComponent } from "../Graficos/metros-perforados-equipo/metros-perforados-equipo.component";
import { MetrosPerforadosLaborComponent } from "../Graficos/metros-perforados-labor/metros-perforados-labor.component";
import { CommonModule } from '@angular/common';
import { LongitudDePerforacionComponent } from "../Graficos/longitud-de-perforacion/longitud-de-perforacion.component";
import { HorometrosComponent } from "../Graficos/horometros/horometros.component";
import { GraficoEstadosComponent } from "../Graficos/grafico-estados/grafico-estados.component";
import { PromedioDeEstadosGeneralComponent } from "../Graficos/promedio-de-estados-general/promedio-de-estados-general.component";
import { RendimientoDePerforacionesComponent } from "../Graficos/rendimiento-de-perforaciones/rendimiento-de-perforaciones.component";
import { DisponibilidadMecanicaEquipoComponent } from "../Graficos/disponibilidad-mecanica-equipo/disponibilidad-mecanica-equipo.component";
import { DisponibilidadMecanicaGeneralComponent } from "../Graficos/disponibilidad-mecanica-general/disponibilidad-mecanica-general.component";
import { UtilizacionEquipoComponent } from "../Graficos/utilizacion-equipo/utilizacion-equipo.component";
import { UtilizacionGeneralComponent } from "../Graficos/utilizacion-general/utilizacion-general.component";
import { Meta } from '../../../../models/meta.model';
import { MetaLargoService } from '../../../../services/meta-largo.service';
import { SumaMetrosPerforadosComponent } from "../Graficos/suma-metros-perforados/suma-metros-perforados.component";
import { RendimientoPromedioComponent } from "../Graficos/rendimiento-promedio/rendimiento-promedio.component";
import * as XLSX from 'xlsx-js-style';
import { ExcelExportServiceLargoFiltro } from '../../../../services/export/filtro/ExcelExportService.service';
import { ExcelExportService } from '../../../../services/export/general/ExcelExportService.service';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { ExcelImportLargoService } from '../../../../services/import/ExcelImportLargoService.service';

 
@Component({
  selector: 'app-taladro-largo-grafica',
  imports: [NgApexchartsModule, CommonModule, FormsModule, MetrosPerforadosEquipoComponent, MetrosPerforadosLaborComponent, LongitudDePerforacionComponent, HorometrosComponent, GraficoEstadosComponent, PromedioDeEstadosGeneralComponent, RendimientoDePerforacionesComponent, DisponibilidadMecanicaEquipoComponent, DisponibilidadMecanicaGeneralComponent, UtilizacionEquipoComponent, UtilizacionGeneralComponent, SumaMetrosPerforadosComponent, RendimientoPromedioComponent, SchedulerComponent],
  templateUrl: './taladro-largo-grafica.component.html',
  styleUrl: './taladro-largo-grafica.component.css'
})
export class TaladroLargoGraficaComponent implements OnInit {
  datosOperaciones: NubeOperacion[] = [];
  datosOperacionesExport: NubeOperacion[] = [];
  datosGraficobarrasapiladasLargo: any[] = [];
  datosHorometros: any[] = [];
  datosGraficoEstados: any[] = [];
  datosOperacionesOriginal: NubeOperacion[] = [];
  RendimientoPerforacion: any[] = [];
ganttData: any[] = [];
  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];
private todasLasMetas: Meta[] = [];
  metasPorGrafico: { 
    [key: string]: Meta[] 
  } = {
    'METROS PERFORADOS - EQUIPO': [],
    'METROS PERFORADOS - LABOR': [],
    'LONGITUD DE PERFORACION': [],
    'HOROMETROS': [],
    'ESTADOS DE EQUIPOS': [],
    'ESTADOS GENERAL': [],
    'DISPONIBILIDAD MECANICA - EQUIPO': [],
    'DISPONIBILIDAD MECANICA - GENERAL': [],
    'UTILIZACION - EQUIPO': [],
    'UTILIZACION - GENERAL': [],
    'RENDIMIENTO DE PERFORACION - EQUIPO': [],
    'PROMEDIO DE RENDIMIENTO': [],
    'SUMA DE METROS PERFORADOS': [],
  };

 
  constructor(private excelExportService: ExcelExportService, private excelExportServiceFiltro: ExcelExportServiceLargoFiltro, private metaService: MetaLargoService, private operacionService: OperacionService, private excelImportLargoService: ExcelImportLargoService) {}
 
  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    this.obtenerDatos();
    this.cargarMetasDesdeApi();
  }

  private calcularFechaMina(fechaOriginal?: string, turno?: string): string {
  if (!fechaOriginal) return '';

  if (turno?.toLowerCase() === 'noche') {
    const fecha = new Date(fechaOriginal as string); // Aseguramos que no sea undefined
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().split('T')[0];
  }

  return fechaOriginal.split('T')[0];
}


  private cargarMetasDesdeApi(): void {
    this.metaService.getMetas().subscribe({
      next: (metas: Meta[]) => {
        if (metas && metas.length > 0) {
          this.todasLasMetas = metas;
  
          // Filtrar y agrupar las metas según el campo "grafico"
          metas.forEach(meta => {
            if (this.metasPorGrafico[meta.grafico]) {
              this.metasPorGrafico[meta.grafico].push(meta);
            }
          });
  
          // Mostrar en consola las metas por gráfico
        } else {
        }
      },
      error: (error) => {
      }
    });
  }
  
private obtenerMesDeFecha(fecha: string): string {
  if (!fecha) return '';
  
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Dividir la fecha y crear el Date objeto en UTC para evitar problemas de zona horaria
  const partes = fecha.split('-');
  const year = parseInt(partes[0], 10);
  const month = parseInt(partes[1], 10) - 1; // Restamos 1 porque los meses en Date son 0-based
  const day = parseInt(partes[2], 10);
  
  // Crear la fecha en UTC
  const date = new Date(Date.UTC(year, month, day));
  
  return meses[date.getUTCMonth()]; // Usamos getUTCMonth() para obtener el mes correcto
}

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();
  
    // Turno de día: 7:00 AM a 6:59 PM (07:00 - 18:59)
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    } else {
      // Turno de noche: 7:00 PM a 6:59 AM
      return 'NOCHE';
    }
  }  
  
  quitarFiltros(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };
  
    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
    
    // Filtrar metas según el mes actual
    this.filtrarMetasPorMes(this.fechaDesde, this.fechaHasta);
    
    this.reprocesarTodosLosGraficos();

    this.construirGanttData(this.datosOperaciones);
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // meses comienzan en 0
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  aplicarFiltrosLocales(): void {
    // Crear objeto con los filtros actuales
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };
  
    // Aplicar filtros a los datos ORIGINALES (this.datosOperacionesOriginal)
    const datosFiltrados = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  
    // Actualizar los datos filtrados
    this.datosOperaciones = datosFiltrados;

    this.construirGanttData(this.datosOperaciones);
  
    // Filtrar metas según el mes de la fecha de inicio
    this.filtrarMetasPorMes(this.fechaDesde, this.fechaHasta) ;
  
    // Reprocesar los gráficos con los datos filtrados
    this.reprocesarTodosLosGraficos();
  }

private filtrarMetasPorMes(fechaInicio: string, fechaHasta: string): void {
  const mesSeleccionado = this.obtenerMesDeFecha(fechaInicio); // Asumiendo un mes por ahora
  const cantidadDias = this.obtenerCantidadDias(fechaInicio, fechaHasta);
  const multiplicadorTurno = this.turnoSeleccionado === '' ? 2 : 1;

  // Reiniciar metas por gráfico
  Object.keys(this.metasPorGrafico).forEach(key => {
    this.metasPorGrafico[key] = [];
  });

  this.todasLasMetas.forEach(meta => {
    if (meta.mes === mesSeleccionado && this.metasPorGrafico[meta.grafico]) {
      const metaClonada = { ...meta };
      
      // Cálculo final: objetivo * cantidad de días * multiplicador de turno
      metaClonada.objetivo = meta.objetivo * cantidadDias * multiplicadorTurno;

      this.metasPorGrafico[meta.grafico].push(metaClonada);
    }
  });
}

private obtenerCantidadDias(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin.getTime() - inicio.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  return diffDays;
}


  
  filtrarDatos(datos: NubeOperacion[], filtros: any): NubeOperacion[] {
    return datos.filter(operacion => {
      const fechaOperacion = new Date(operacion.fecha_mina ?? '');
      const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
      const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;
  
      // Verificar si la fecha de operación está dentro del rango
      if (fechaDesde && fechaOperacion < fechaDesde) {
        return false;
      }
  
      if (fechaHasta && fechaOperacion > fechaHasta) {
        return false;
      }
  
      // Verificar si el turno de la operación coincide con el turno seleccionado
      if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) {
        return false;
      }
  
      return true;
    });
  }
   
  
  reprocesarTodosLosGraficos(): void {
    this.prepararDatosGraficoBarrasApilada();
    this.prepararDatosHorometros();
    this.prepararDatosGraficoEstados();
    this.prepararDatoRendimientoPerforacion();

  }

  obtenerDatos(): void {
    this.operacionService.getOperacionesLargo().subscribe({
      next: (data: NubeOperacion[]) => {
      // 🟢 Agregar la columna calculada antes de guardar
      const dataConFechaMina = data.map((op: NubeOperacion) => ({
        ...op,
        fecha_mina: this.calcularFechaMina(op.fecha, op.turno)
      }));

        this.datosOperacionesOriginal = dataConFechaMina;
        this.datosOperacionesExport = dataConFechaMina
  
        // Aplicar filtros por fecha actual y turno automáticamente
        const filtros = {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          turnoSeleccionado: this.turnoSeleccionado
        };
  
        this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  
        this.construirGanttData(this.datosOperaciones);

        // Procesar datos para los gráficos
        this.prepararDatosGraficoBarrasApilada();
        this.prepararDatosHorometros();
        this.prepararDatosGraficoEstados();
        this.prepararDatoRendimientoPerforacion();
      },
      error: (err) => {
        console.error('❌ Error al obtener datos:', err);
      }
    });
  }

  prepararDatosGraficoBarrasApilada(): void {
    this.datosGraficobarrasapiladasLargo = this.datosOperaciones.flatMap(operacion => {
      return operacion.perforaciones?.flatMap(perforacion => {
        return perforacion.inter_perforaciones?.map(inter => ({
          equipo: operacion.equipo,
          codigo: operacion.codigo,
          longitud_perforacion: inter.longitud_perforacion,
          tipo_labor: perforacion.tipo_labor,
          labor: perforacion.labor,
          ntaladro: inter.ntaladro,
        })) || [];
      }) || [];
    });
  }

  prepararDatosHorometros(): void {
    this.datosHorometros = this.datosOperaciones.flatMap(operacion => 
      operacion.horometros?.map(horometro => ({
        operacionId: operacion.id,
        equipo: operacion.equipo,
        codigo: operacion.codigo,
        turno: operacion.turno,
        fecha: operacion.fecha,
        nombreHorometro: horometro.nombre,
        inicial: horometro.inicial,
        final: horometro.final,
        diferencia: horometro.final - horometro.inicial,
        EstaOP: horometro.EstaOP,
        EstaINOP: horometro.EstaINOP
      })) || []
    );
  }

  prepararDatosGraficoEstados(): void {
    this.datosGraficoEstados = this.datosOperaciones.flatMap(operacion => 
      operacion.estados?.map(estado => ({
        codigoOperacion: operacion.codigo,
        turno: operacion.turno,
        estado: estado.estado,
        codigoEstado: estado.codigo,
        hora_inicio: estado.hora_inicio,
        hora_final: estado.hora_final
      })) || []
    );
  }

  prepararDatoRendimientoPerforacion(): void {
    const agrupadoPorOperacion = new Map<string, {
      codigo: string;
      estados: {
        estado: string;
        codigoEstado: string;
        hora_inicio: string;
        hora_final: string;
      }[];
      perforaciones: { 
        longitud_perforacion: number;
        ntaladro: number;
      }[];
    }>();
  
    for (const operacion of this.datosOperaciones) {
      const codigo = operacion.codigo;
      if (!agrupadoPorOperacion.has(codigo)) {
        agrupadoPorOperacion.set(codigo, {
          codigo,
          estados: (operacion.estados || []).map(estado => ({
            estado: estado.estado,
            codigoEstado: estado.codigo,
            hora_inicio: estado.hora_inicio,
            hora_final: estado.hora_final
          })),
          perforaciones: []
        });
      }
  
      const grupo = agrupadoPorOperacion.get(codigo)!;
  
      operacion.perforaciones?.forEach(perforacion => {
        perforacion.inter_perforaciones?.forEach(inter => {
          grupo.perforaciones.push({
            longitud_perforacion: inter.longitud_perforacion,
            ntaladro: inter.ntaladro,
          });
        });
      });
    }
  
    // Convertimos el mapa en array final
    this.RendimientoPerforacion = Array.from(agrupadoPorOperacion.values());
  
  }
  
  exportToExcel() {
  this.excelExportService.exportOperacionesToExcel(
    this.datosOperacionesExport, 
    'Reporte_Operaciones_Largo'
  );
}

exportToExcelFiltro() {
  this.excelExportServiceFiltro.exportOperacionesToExcel(
    this.datosOperaciones, 
    'Reporte_Operaciones_Largo'
  );
}

importandoLargo = false;
mensajeImportLargo: string = '';

onImportarExcelLargo(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  input.value = '';
  this.importandoLargo = true;
  this.mensajeImportLargo = '';

  this.excelImportLargoService.importFromExcel(file).then(({ operaciones, errores }) => {
    if (errores.length) {
      console.warn('Advertencias de importación:', errores);
    }
    this.operacionService.postOperacionesLargo(operaciones).subscribe({
      next: () => {
        this.importandoLargo = false;
        this.mensajeImportLargo = `Importación exitosa: ${operaciones.length} operación(es) enviadas.`;
        this.obtenerDatos();
      },
      error: (err) => {
        this.importandoLargo = false;
        this.mensajeImportLargo = 'Error al enviar los datos al servidor.';
        console.error('Error POST importar largo:', err);
      }
    });
  }).catch(err => {
    this.importandoLargo = false;
    this.mensajeImportLargo = 'Error al leer el archivo Excel.';
    console.error(err);
  });
}

private construirGanttData(datos: NubeOperacion[]) {

  const fechaMap: Record<string, any> = {};

  datos.forEach(operacion => {

    const fecha = operacion.fecha_mina ?? operacion.fecha;
    const equipoCodigo = `${operacion.equipo} - ${operacion.codigo}`;

    if (!fechaMap[fecha]) {
      fechaMap[fecha] = {};
    }

    if (!fechaMap[fecha][equipoCodigo]) {
      fechaMap[fecha][equipoCodigo] = {};
    }

    operacion.estados?.forEach(est => {

      const labor = est.estado || 'SIN LABOR';

      if (!fechaMap[fecha][equipoCodigo][labor]) {
        fechaMap[fecha][equipoCodigo][labor] = [];
      }

      fechaMap[fecha][equipoCodigo][labor].push({
        start: est.hora_inicio,
        end: est.hora_final,
        estado: est.estado,
        description: est.codigo
      });

    });
  });

  // 🔁 Normalización final
  this.ganttData = Object.entries(fechaMap).map(
    ([fecha, equipos]: any) => ({
      fecha,
      groups: Object.entries(equipos).map(
        ([equipoCodigo, labores]: any) => ({
          equipoCodigo,
          rows: Object.entries(labores).map(
            ([labor, tasks]: any) => ({
              labor,
              tasks
            })
          )
        })
      )
    })
  );

  console.log('📊 GANTT DATA FINAL:', this.ganttData);
}

}
