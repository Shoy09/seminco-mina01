import { Component, OnInit } from '@angular/core';

import { NubeInterPerforacionHorizontal, NubeOperacion } from '../../../../models/operaciones.models';
import { GraficoBarrasComponent } from "../Graficos/grafico-barras/grafico-barras.component";
import { CommonModule } from '@angular/common';
import { OperacionService } from '../../../../services/OperacionService .service';
import { GraficoBarrasAgrupadaComponent } from "../Graficos/grafico-barras-agrupada/grafico-barras-agrupada.component";
import { PromNumTaladroTipoLaborComponent } from "../Graficos/prom-num-taladro-tipo-labor/prom-num-taladro-tipo-labor.component";
import { PromMetrosPerforadosSeccionComponent } from "../Graficos/prom-metros-perforados-seccion/prom-metros-perforados-seccion.component";
import { PromNumTaladroSeccionComponent } from "../Graficos/prom-num-taladro-seccion/prom-num-taladro-seccion.component";
import { GraficoHorometrosComponent } from "../Graficos/grafico-horometros/grafico-horometros.component";
import { GraficoBarrasMetrosLaborComponent } from "../Graficos/grafico-barras-metros-labor/grafico-barras-metros-labor.component";
import { GraficoBarrasAgrupadaNumLaborComponent } from "../Graficos/grafico-barras-agrupada-num-labor/grafico-barras-agrupada-num-labor.component";
import { GraficoEstadosComponent } from "../Graficos/grafico-estados/grafico-estados.component";
import { FormsModule } from '@angular/forms';
import { PromedioTaladrosComponent } from "../Graficos/promedio-taladros/promedio-taladros.component";
import { BarrasMetroPerforadosLaborComponent } from "../Graficos/barras-metro-perforados-labor/barras-metro-perforados-labor.component";
import { PromedioDeEstadosGeneralComponent } from "../Graficos/promedio-de-estados-general/promedio-de-estados-general.component";
import { RendimientoDePerforacionesComponent } from "../Graficos/rendimiento-de-perforaciones/rendimiento-de-perforaciones.component";
import { DisponibilidadMecanicaEquipoComponent } from "../Graficos/disponibilidad-mecanica-equipo/disponibilidad-mecanica-equipo.component";
import { DisponibilidadMecanicaGeneralComponent } from "../Graficos/disponibilidad-mecanica-general/disponibilidad-mecanica-general.component";
import { UtilizacionEquipoComponent } from "../Graficos/utilizacion-equipo/utilizacion-equipo.component";
import { UtilizacionGeneralComponent } from "../Graficos/utilizacion-general/utilizacion-general.component";
import { MetaService } from '../../../../services/meta.service';
import { Meta } from '../../../../models/meta.model';
import { SumaMetrosPerforadosComponent } from "../Graficos/suma-metros-perforados/suma-metros-perforados.component";
import { RendimientoPromedioComponent } from "../Graficos/rendimiento-promedio/rendimiento-promedio.component";
import * as XLSX from 'xlsx-js-style';
import { ExcelHorizontalExportServiceFiltro } from '../../../../services/export/filtro/ExcelHorizontalExportService.service';
import { ExcelHorizontalExportService } from '../../../../services/export/general/ExcelHorizontalExportService.service';
@Component({
  selector: 'app-taladro-horizontal-grafica',
  standalone: true,
  imports: [FormsModule, GraficoBarrasComponent, CommonModule, GraficoBarrasAgrupadaComponent, PromNumTaladroTipoLaborComponent, PromMetrosPerforadosSeccionComponent, GraficoHorometrosComponent, GraficoBarrasMetrosLaborComponent, GraficoBarrasAgrupadaNumLaborComponent, GraficoEstadosComponent, PromedioTaladrosComponent, BarrasMetroPerforadosLaborComponent, PromedioDeEstadosGeneralComponent, RendimientoDePerforacionesComponent, DisponibilidadMecanicaEquipoComponent, DisponibilidadMecanicaGeneralComponent, UtilizacionEquipoComponent, UtilizacionGeneralComponent, SumaMetrosPerforadosComponent, RendimientoPromedioComponent],
  templateUrl: './taladro-horizontal-grafica.component.html',
  styleUrl: './taladro-horizontal-grafica.component.css'
}) 
export class TaladroHorizontalGraficaComponent implements OnInit {
  datosOperaciones: NubeOperacion[] = [];
  datosOperacionesExport: NubeOperacion[] = [];
  datosGraficobarrasapiladas: any[] = [];
  datosGraficobarrasagrupadas: any[] = [];
  paraPromedioTaladrosSeccion: any[] = [];
  RendimientoPerforacion: any[] = [];
  ParaPromediosPromnumtaladrotipolabor: any[] = [];
  ParaPromediostaladrosmetrosperforadosSeccion: any[] = [];
  ParaPromediostaladrosnumtaladroSeccion: any[] = [];
  datosHorometros: any[] = [];
  datosGraficoEstados: any[] = [];
  datosOperacionesOriginal: NubeOperacion[] = [];
  private todasLasMetas: Meta[] = [];
  metasPorGrafico: { 
    [key: string]: Meta[] 
  } = {
    'METROS PERFORADOS - EQUIPO': [],
    'METROS PERFORADOS - LABOR': [],
    'CANTIDAD DE TALADROS - EQUIPO': [],
    'CANTIDAD DE TALADROS - LABOR': [],
    'LONGITUD DE PERFORACION': [],
    'PROMEDIO DE TALADROS - SECCION': [],
    'PROMEDIO DE TALADROS - LABOR': [],
    'PROMEDIO DE METROS PERFORADOS - SECCION': [],
    'ESTADOS': [],
    'ESTADOS GENERAL': [],
    'HOROMETROS': [],
    'RENDIMIENTO DE PERFORACION - EQUIPO': [],
    'DISPONIBILIDAD MECANICA - EQUIPO': [],
    'DISPONIBILIDAD MECANICA - GENERAL': [],
    'UTILIZACION - EQUIPO': [], 
    'UTILIZACION - GENERAL': [],
    'SUMA DE METROS PERFORADOS': [],
    'PROMEDIO DE RENDIMIENTO': []
  };
  

  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];


  constructor( private excelHorizontalExportServicefiltro: ExcelHorizontalExportServiceFiltro, private excelHorizontalExportService: ExcelHorizontalExportService, private metaService: MetaService, private operacionService: OperacionService) {}

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
    this.prepararDatosGraficoBarrasAgrupada();
    this.prepararDatosParaPromediostaladrosSeccion();
    this.prepararDatosParaPromnumtaladrotipolabor();
    this.prepararDatosParaPromediostaladrosmetrosperforadosSeccion();
    this.prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion();
    this.prepararDatosHorometros();
    this.prepararDatosGraficoEstados();
    this.prepararDatoRendimientoPerforacion();
  }
 
obtenerDatos(): void {
  this.operacionService.getOperacionesHorizontal().subscribe({
    next: (data: NubeOperacion[]) => {
      // 🟢 Agregar la columna calculada antes de guardar
      const dataConFechaMina = data.map((op: NubeOperacion) => ({
        ...op,
        fecha_mina: this.calcularFechaMina(op.fecha, op.turno)
      }));

      this.datosOperacionesOriginal = dataConFechaMina;
      this.datosOperacionesExport = dataConFechaMina;

      // Aplicar filtros por fecha actual y turno automáticamente
      const filtros = {
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta,
        turnoSeleccionado: this.turnoSeleccionado
      };

      this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);

        // Procesar datos para los gráficos
        this.prepararDatosGraficoBarrasApilada();
        this.prepararDatosGraficoBarrasAgrupada();
        this.prepararDatosParaPromediostaladrosSeccion();
        this.prepararDatosParaPromnumtaladrotipolabor();
        this.prepararDatosParaPromediostaladrosmetrosperforadosSeccion();
        this.prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion();
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
    this.datosGraficobarrasapiladas = this.datosOperaciones.flatMap(operacion => {
      return operacion.perforaciones_horizontal?.flatMap(perforacion => {
        return perforacion.inter_perforaciones_horizontal?.map(inter => ({
          equipo: operacion.equipo,
          codigo: operacion.codigo,
          longitud_perforacion: inter.longitud_perforacion,
          tipo_labor: perforacion.tipo_labor,
          labor: perforacion.labor,
          ntaladro: inter.ntaladro,
          ntaladros_rimados: inter.ntaladros_rimados,
        })) || [];
      }) || [];
    });
  }

prepararDatosGraficoBarrasAgrupada(): void {
  this.datosGraficobarrasagrupadas = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        equipo: operacion.equipo,
        codigo: operacion.codigo,
        tipo_labor: perforacion.tipo_labor,
        labor: perforacion.labor,
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosSeccion(): void {
  this.paraPromedioTaladrosSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0,
      })) || []
    ) || []
  );
} 
 
prepararDatosParaPromnumtaladrotipolabor(): void {
  this.ParaPromediosPromnumtaladrotipolabor = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        ntaladro: inter.ntaladro || 0,
        ntaladros_rimados: inter.ntaladros_rimados || 0,
        tipo_labor: perforacion.tipo_labor,
        labor: perforacion.labor,
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosmetrosperforadosSeccion(): void {
  this.ParaPromediostaladrosmetrosperforadosSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        longitud_perforacion: inter.longitud_perforacion,
        ntaladro: inter.ntaladro,
        ntaladros_rimados: inter.ntaladros_rimados,
      })) || []
    ) || []
  );
}

prepararDatosParaPromediostaladrosSecciónnumtaladroSeccion(): void {
  this.ParaPromediostaladrosnumtaladroSeccion = this.datosOperaciones.flatMap(operacion => 
    operacion.perforaciones_horizontal?.flatMap(perforacion => 
      perforacion.inter_perforaciones_horizontal?.map(inter => ({
        seccion_la_labor: inter.seccion_la_labor,
        ntaladro: inter.ntaladro || 0,
      })) || []
    ) || []
  );
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
      ntaladros_rimados: number;
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

    operacion.perforaciones_horizontal?.forEach(perforacion => {
      perforacion.inter_perforaciones_horizontal?.forEach(inter => {
        grupo.perforaciones.push({
          longitud_perforacion: inter.longitud_perforacion,
          ntaladro: inter.ntaladro,
          ntaladros_rimados: inter.ntaladros_rimados
        });
      });
    });
  }

  // Convertimos el mapa en array final
  this.RendimientoPerforacion = Array.from(agrupadoPorOperacion.values());

}

exportToExcelHorizontal() {
  this.excelHorizontalExportService.exportOperacionesToExcel(
    this.datosOperacionesExport,
    'Reporte_Operaciones'
  );
}

exportToExcelHorizontalfiltro() {
  // Mostrar los datos crudos
  console.log('📊 Datos de operaciones:', this.datosOperaciones);

  // Mostrar los datos formateados como JSON
  console.log('🧩 Datos en formato JSON:\n', JSON.stringify(this.datosOperaciones, null, 2));

  this.excelHorizontalExportServicefiltro.exportOperacionesToExcel(
    this.datosOperaciones,
    'Reporte_Operaciones'
  );
}

}
