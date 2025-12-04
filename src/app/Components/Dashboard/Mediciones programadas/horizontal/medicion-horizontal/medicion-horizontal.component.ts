import { Component, inject, OnInit } from '@angular/core';
import { ExcelMedicionesHorizontalService } from './excel-mediciones-horizontal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicionesHorizontal } from '../../../../../models/MedicionesHorizontal';
import { MedicionesHorizontalService } from '../../../../../services/mediciones-horizontal.service';
import { Tonelada } from '../../../../../models/tonelada';
import { ToneladasService } from '../../../../../services/toneladas.service';
import { FactorAvanceComponent } from '../graficos/Graficos - Fechas/factor-avance/factor-avance.component';
import { FactorAvanceSegundoComponent } from '../graficos/Graficos - Fechas/factor-avance-segundo/factor-avance-segundo.component';
import { FactorAvanceSemanaComponent } from "../graficos/Graficos - Mes Semana/factor-avance-semana/factor-avance-semana.component";
import { FactorAvanceSegundoSemanaComponent } from "../graficos/Graficos - Mes Semana/factor-avance-segundo-semana/factor-avance-segundo-semana.component";
import { FactorAvanceDiasSemanaComponent } from "../graficos/Graficos - Dias Semanas/factor-avance-dias-semana/factor-avance-dias-semana.component";
import { FactorAvanceSegundoDiasSemanaComponent } from "../graficos/Graficos - Dias Semanas/factor-avance-segundo-dias-semana/factor-avance-segundo-dias-semana.component";
import { PdfExportService } from '../pdf-export.service';
import { AuthService } from '../../../../../services/auth-service.service';
import { MedicionesHorizontalProgramadoService } from '../../../../../services/mediciones-horizontal-programado.service';
import { CalculoDialogComponent, DialogData } from '../../dialog/calculo-dialog/calculo-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TipoPerforacion } from '../../../../../models/tipo-perforacion.model';
import { TipoPerforacionService } from '../../../../../services/tipo-perforacion.service';
import { NubeDatosTrabajoExploracionesService } from '../../../../../services/nube-datos-trabajo-exploraciones.service';
import { forkJoin } from 'rxjs';
import { NubeDatosTrabajoExploraciones } from '../../../../../models/nube-datos-trabajo-exploraciones';
import { ExplosivoService } from '../../../../../services/explosivo.service';
import { Explosivo } from '../../../../../models/Explosivo';
import { LoadingDialogComponent } from '../../dialog/loading-dialog/loading-dialog.component';


@Component({
  selector: 'app-medicion-horizontal',
  templateUrl: './medicion-horizontal.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, FactorAvanceComponent, FactorAvanceSegundoComponent, FactorAvanceSemanaComponent, FactorAvanceSegundoSemanaComponent, FactorAvanceDiasSemanaComponent, FactorAvanceSegundoDiasSemanaComponent],
  styleUrls: ['./medicion-horizontal.component.css']
})
export class MedicionHorizontalProgramadoComponent implements OnInit {
  datosOperaciones: MedicionesHorizontal[] = [];
  datosOperacionesExport: MedicionesHorizontal[] = [];
  datosOperacionesOriginal: MedicionesHorizontal[] = [];

  datosOperacionesExplo: MedicionesHorizontal[] = [];

  tiposPerforacion: TipoPerforacion[] = [];
  exploracionesPorTipo: { [key: string]: NubeDatosTrabajoExploraciones[] } = {};
explosivos: Explosivo[] = [];
 // Variables de control para saber qué datos están cargados
  private datosHorizontalCargados: boolean = false;
  private datosTalLargoCargados: boolean = false;

  fechaDesde: string = '';
  fechaHasta: string = '';
  turnoSeleccionado: string = '';
  turnos: string[] = ['Dia', 'Noche'];
 private dialog = inject(MatDialog);
 private dialogRef: any;
  toneladas: Tonelada[] = [];

  constructor(private explosivoService: ExplosivoService, private exploracionesService: NubeDatosTrabajoExploracionesService, private tipoPerforacionService: TipoPerforacionService, private pdfService: PdfExportService, private medicionService: MedicionesHorizontalProgramadoService,
  private excelService: ExcelMedicionesHorizontalService, private toneladasService: ToneladasService, private authService: AuthService ) {}

  ngOnInit(): void {
    // Abrimos el dialog de carga
  this.dialogRef = this.dialog.open(LoadingDialogComponent, {
    disableClose: true,
    data: { cargando: true, mensaje: "Cargando datos..." }
  });
  
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();

    this.obtenerExplosivos();
    this.obtenerToneladas(); 
    this.obtenerDatos();
    this.obtenerTiposPerforacionTaladroLargo();
  }

  obtenerExplosivos() {
  this.explosivoService.getExplosivos().subscribe({
    next: (data) => {
      this.explosivos = data;
      console.log('✅ Explosivos recibidos:', this.explosivos);
    },
    error: (err) => {
      console.error('🚫 Error al obtener explosivos:', err);
    }
  });
}

 obtenerTiposPerforacionTaladroLargo() {
    this.tipoPerforacionService.getTiposPerforacion().subscribe({
      next: (tipos) => {
        this.tiposPerforacion = tipos.filter(
          (t) => t.proceso?.toUpperCase().includes('TALADROS LARGOS')
        );

        console.log('✅ Tipos filtrados (TALADROS LARGOS):', this.tiposPerforacion);

        // Llamamos al método que hace las peticiones
        this.obtenerExploracionesPorCadaTipo();
      },
      error: (err) => console.error('🚫 Error al obtener tipos de perforación:', err),
    });
  }

obtenerExploracionesPorCadaTipo() {
  const llamadas = this.tiposPerforacion.map((tipo) =>
    this.exploracionesService.getExploracionesPorTipo(tipo.nombre)
  );

  forkJoin(llamadas).subscribe({
    next: (resultados) => {
      this.tiposPerforacion.forEach((tipo, i) => {
        const data = (resultados[i]?.data || []).map((registro: any) => {
          // 🧩 Si el backend envía "semanaDefault", lo copiamos a "semana"
          return {
            ...registro,
            semana: registro.semanaDefault ?? registro.semana ?? ''
          };
        });

        this.exploracionesPorTipo[tipo.nombre] = data;
        console.log(`📊 Exploraciones para ${tipo.nombre}:`, data);
      });

      console.log('✅ Todas las exploraciones por tipo:', this.exploracionesPorTipo);

      // Esperar a que explosivos esté cargado
      if (this.explosivos.length > 0) {
        this.procesarDatosTalLargo();
      } else {
        console.warn('⚠️ No hay explosivos cargados todavía. Esperando...');
        const checkExplosivos = setInterval(() => {
          if (this.explosivos.length > 0) {
            clearInterval(checkExplosivos);
            this.procesarDatosTalLargo();
          }
        }, 500);
      }
    },
    error: (err) => console.error('🚫 Error al obtener exploraciones por tipo:', err),
  });
}


  procesarDatosTalLargo() {
    const datosFormateados: MedicionesHorizontal[] = [];

    for (const tipo in this.exploracionesPorTipo) {
      const exploraciones = this.exploracionesPorTipo[tipo];

      exploraciones.forEach((registro: any) => {
        let totalKg = 0;

        // --- Calcular totales de despachos ---
        const despachosTotales: Record<string, number> = {};
        (registro.despachos || []).forEach((d: any) => {
          (d.detalles || []).forEach((detalle: any) => {
            const nombre = detalle.nombre_material;
            const cantidad = Number(detalle.cantidad) || 0;
            despachosTotales[nombre] = (despachosTotales[nombre] || 0) + cantidad;
          });
        });

        // --- Calcular totales de devoluciones ---
        const devolucionesTotales: Record<string, number> = {};
        (registro.devoluciones || []).forEach((d: any) => {
          (d.detalles || []).forEach((detalle: any) => {
            const nombre = detalle.nombre_material;
            const cantidad = Number(detalle.cantidad) || 0;
            devolucionesTotales[nombre] = (devolucionesTotales[nombre] || 0) + cantidad;
          });
        });

        // --- Calcular diferencia y peso total ---
        Object.entries(despachosTotales).forEach(([nombre, cantidadDespacho]) => {
          const cantidadDevolucion = devolucionesTotales[nombre] || 0;
          const diferencia = cantidadDespacho - cantidadDevolucion;

          const explosivo = this.explosivos.find((e) => e.tipo_explosivo === nombre);
          if (explosivo) {
            totalKg += diferencia * explosivo.peso_unitario;
          }
        });

        // --- Aplicar ajustes de fecha y semana ---
        const nuevaFecha = new Date(registro.fecha);
        if (registro.turno?.toLowerCase() === 'noche') {
          nuevaFecha.setDate(nuevaFecha.getDate() + 1);
        }

        const semanaLimpia = registro.semana
          ? registro.semana.toString().replace(/semana\s*/i, '').trim()
          : '';

        // --- Crear objeto de medición ---
        const medicion: MedicionesHorizontal = {
          id: registro.id ?? null,
          fecha: registro.fecha,
          turno: registro.turno,
          empresa: registro.empresa,
          zona: registro.zona,
          labor: `${registro.tipo_labor ?? ''} ${registro.labor ?? ''} ${registro.ala ?? ''}`.trim(),
          veta: registro.veta,
          tipo_perforacion: registro.tipo_perforacion,
          kg_explosivos: Number(totalKg.toFixed(2)),
          avance_programado: registro.avance_programado ?? null,
          ancho: registro.ancho ?? null,
          alto: registro.alto ?? null,
          envio: registro.envio ?? 0,
          id_explosivo: registro.id ?? null,
          idnube: registro.idnube ?? null,
          no_aplica: registro.no_aplica ?? 0,
          remanente: registro.remanente ?? 0,
          semana: semanaLimpia,
          fechaAjustada: nuevaFecha.toISOString().split('T')[0]
        };

        datosFormateados.push(medicion);
      });
    }

    // ✅ Guardar datos de Tal Largo
    this.datosOperacionesExplo = datosFormateados;
    this.datosTalLargoCargados = true;

    console.log("✅ Datos de Tal Largo procesados:", datosFormateados);
    
    // Combinar con datos horizontales si ya están cargados
    this.combinarYActualizarDatos();
  }


  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();

    if (hora >= 7 && hora < 19) {
      return 'Dia';
    } else {
      return 'Noche';
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
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  aplicarFiltrosLocales(): void {
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);
  }

  filtrarDatos(datos: MedicionesHorizontal[], filtros: any): MedicionesHorizontal[] {
  return datos.filter(operacion => {
    const fechaOperacion = new Date(
      (operacion as any).fechaAjustada || operacion.fecha
    );

    const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

    if (fechaDesde && fechaOperacion < fechaDesde) return false;
    if (fechaHasta && fechaOperacion > fechaHasta) return false;
    if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) return false;

    return true;
  });
}


  obtenerDatos(): void {
    this.medicionService.getMediciones().subscribe({
      next: (data: MedicionesHorizontal[]) => {
        // Procesar datos horizontales
        const datosAjustados = data.map(item => {
          const nuevaFecha = new Date(item.fecha);
          if (item.turno?.toLowerCase() === 'noche') {
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
          }

          const semanaLimpia = item.semana
            ? item.semana.toString().replace(/semana\s*/i, '').trim()
            : '';

          return {
            ...item,
            semana: semanaLimpia,
            fechaAjustada: nuevaFecha.toISOString().split('T')[0]
          };
        });

        // ✅ Guardar datos horizontales
        this.datosOperacionesOriginal = datosAjustados;
        this.datosOperacionesExport = data;
        this.datosHorizontalCargados = true;

        console.log("✅ Datos horizontales ajustados:", datosAjustados);
        
        // Combinar con datos Tal Largo si ya están cargados
        this.combinarYActualizarDatos();
      },
      error: (err) => {
        console.error('❌ Error al obtener datos horizontales:', err);
      }
    });
  }

   private combinarYActualizarDatos() {
    // Solo proceder si ambos conjuntos están cargados
    if (!this.datosHorizontalCargados || !this.datosTalLargoCargados) {
      console.log('⏳ Esperando que ambos conjuntos de datos se carguen...');
      return;
    }

    // Combinar datos
    const datosCombinados = [
      ...this.datosOperacionesOriginal, 
      ...this.datosOperacionesExplo
    ];

    // Actualizar variables centralizadas
    this.datosOperacionesOriginal = datosCombinados;
    this.datosOperacionesExport = [
      ...this.datosOperacionesExport, 
      ...this.datosOperacionesExplo.map(item => ({ ...item, fechaAjustada: undefined }))
    ];

    // Aplicar filtros
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    this.datosOperaciones = this.filtrarDatos(this.datosOperacionesOriginal, filtros);

    // -------- ACTUALIZAR DIALOG --------
    this.dialogRef.componentInstance.data = {
      cargando: false,
      mensaje: "Datos cargados correctamente",
      error: false
    };

    // Cerrarlo después de 2 segundos
    setTimeout(() => {
      this.dialogRef.close();
    }, 2000);

  } catch (error: unknown) {
  console.error("Error procesando datos:", error);

  this.dialogRef.componentInstance.data = {
    cargando: false,
    mensaje: "Ocurrió un error al procesar los datos",
    error: true
  };
}



  obtenerToneladas(): void {
    this.toneladasService.getToneladas().subscribe({
      next: (data: Tonelada[]) => {
        this.toneladas = data;
        console.log("📦 Toneladas recibidas:", data);
      },
      error: (err) => {
        console.error("❌ Error al obtener toneladas:", err);
      }
    });
  }

  exportarFiltrado() {
  this.excelService.exportFiltradaToExcel(this.datosOperaciones, 'MedicionesHorizontal');
}

// Exportar toda la data
exportarCompleto() {
  this.excelService.exportCompletaToExcel(this.datosOperacionesExport, 'MedicionesHorizontal');
}

exportarPdf() {
    this.pdfService.exportChartsToPdf([
      'grafico1',
      'grafico2',
      'grafico3',
      'grafico4',
      'grafico5',
      'grafico6'
    ], 'reporte-graficos.pdf');
  }

  //DIALOGGGGGGGGGGGGGGGGG--------------------------------------------------------------

   mostrarInfoGrafico1(): void {
  const datosReales = this.calcularDatosDetalladosGrafico1();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Avance - Resumen Semanal',
    descripcion: 'Este gráfico muestra el rendimiento promedio de explosivos por metro avanzado y el avance programado promedio, agrupado por semanas. Incluye un promedio general de todas las semanas analizadas.',
    formula: 'Rendimiento (Kg/m) = Total Kg Explosivos / Total Avance  Programado\nAvance Programado Promedio (m) = Total Avance Programado / Número de Registros',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Semana', 'Explosivos (Kg)', 'Avance (m)', 'Rendimiento (Kg/m)', 'Registros', 'Avance Prom (m)'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0 y avance_programado > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      `Total registros: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Semanas procesadas: ${datosReales.semanasProcesadas}`,
      `Rendimiento promedio: ${datosReales.rendimientoPromedio} Kg/m`,
      `Avance promedio: ${datosReales.avancePromedio} m`
    ]
  };

  this.abrirDialog(dialogData);
}

private calcularDatosDetalladosGrafico1(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      semanasProcesadas: 0,
      rendimientoPromedio: 0,
      avancePromedio: 0
    };
  }

  const filtrados = this.datosOperaciones.filter(d => {
    const kg = d?.kg_explosivos ?? 0;
    const avance = d?.avance_programado ?? 0;
    return kg > 0 && avance > 0 && 
           (!d?.no_aplica || d.no_aplica === 0) && 
           (!d?.remanente || d.remanente === 0);
  });

  const grupos: { [semana: string]: { 
    kg: number; 
    avance: number; 
    count: number;
    registros: number;
  } } = {};
  
  filtrados.forEach(d => {
    const semana = d?.semana?.toString() || "Sin semana";
    if (!grupos[semana]) {
      grupos[semana] = { kg: 0, avance: 0, count: 0, registros: 0 };
    }
    grupos[semana].kg += d?.kg_explosivos ?? 0;
    grupos[semana].avance += d?.avance_programado ?? 0;
    grupos[semana].count += 1;
    grupos[semana].registros += 1;
  });

  const datosMuestra: any[] = [];
  let totalRendimiento = 0;
  let totalAvancePromedio = 0;
  let totalExplosivos = 0;
  let totalAvance = 0;
  let totalRegistrosSemanales = 0;
  let semanasValidas = 0;

  Object.keys(grupos).sort().forEach(semana => {
    const grupo = grupos[semana];
    if (grupo.avance > 0 && grupo.count > 0) {
      const rendimiento = Number((grupo.kg / grupo.avance).toFixed(2));
      const avancePromedio = Number((grupo.avance / grupo.count).toFixed(2));
      
      datosMuestra.push([
        `Semana ${semana}`,
        grupo.kg.toLocaleString(),
        grupo.avance.toLocaleString(),
        rendimiento,
        grupo.registros,
        avancePromedio
      ]);

      totalRendimiento += rendimiento;
      totalAvancePromedio += avancePromedio;
      totalExplosivos += grupo.kg;
      totalAvance += grupo.avance;
      totalRegistrosSemanales += grupo.registros;
      semanasValidas++;
    }
  });

  // Calcular promedios generales
  const rendimientoPromedio = semanasValidas > 0 ? Number((totalRendimiento / semanasValidas).toFixed(2)) : 0;
  const avancePromedio = semanasValidas > 0 ? Number((totalAvancePromedio / semanasValidas).toFixed(2)) : 0;
  const explosivosPromedio = semanasValidas > 0 ? Number((totalExplosivos / semanasValidas).toFixed(2)) : 0;
  const avanceTotalPromedio = semanasValidas > 0 ? Number((totalAvance / semanasValidas).toFixed(2)) : 0;
  const registrosPromedio = semanasValidas > 0 ? Number((totalRegistrosSemanales / semanasValidas).toFixed(1)) : 0;

  // Agregar fila de promedio
  if (semanasValidas > 0) {
    datosMuestra.push([
      'PROMEDIO',
      explosivosPromedio.toLocaleString(),
      avanceTotalPromedio.toLocaleString(),
      rendimientoPromedio,
      registrosPromedio,
      avancePromedio
    ]);
  }


  // Agregar resumen si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    semanasProcesadas: semanasValidas,
    rendimientoPromedio,
    avancePromedio,
    totalExplosivos,
    totalAvance
  };
}

//GRAFICO 2 -------------------------------------------------------
mostrarInfoGrafico2(): void {
  const datosReales = this.calcularDatosDetalladosGrafico2();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Explosivos vs Toneladas - Resumen Semanal',
    descripcion: 'Este gráfico muestra la relación entre los kilogramos de explosivos utilizados y las toneladas producidas, agrupado por semanas. Incluye un promedio general de todas las semanas analizadas.',
    formula: 'Kg Explosivos / Toneladas = Total Kg Explosivos / Total Toneladas\nPromedio Semanal = Suma de valores / Número de semanas',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Semana', 'Kg Explosivos', 'Toneladas', 'Kg Explosivos/Tonelada', 'Registros'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      'Las toneladas se obtienen de la tabla de toneladas por zona y labor',
      `Total registros procesados: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Semanas procesadas: ${datosReales.semanasProcesadas}`,
      `Promedio Kg Explosivos: ${datosReales.promedioKgExplosivos}`,
      `Promedio Toneladas: ${datosReales.promedioToneladas}`,
      `Promedio Kg/Tonelada: ${datosReales.promedioKgPorTonelada}`
    ]
  };

  this.abrirDialog(dialogData);
}

private calcularDatosDetalladosGrafico2(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      semanasProcesadas: 0,
      promedioKgExplosivos: 0,
      promedioToneladas: 0,
      promedioKgPorTonelada: 0
    };
  }

  // Aplicar mismo filtro que el gráfico
  const filtrados = this.datosOperaciones.filter(d =>
    d.kg_explosivos &&
    d.labor &&
    d.labor.trim().toUpperCase().startsWith("TJ") && // 🔹 Solo labores que inician con "TJ"
    (!d.no_aplica || d.no_aplica === 0) &&
    (!d.remanente || d.remanente === 0)
  );


  // Agrupar por semana (misma lógica que el gráfico)
  const grupos: { [semana: string]: { 
    kg: number; 
    toneladas: number; 
    count: number;
    registros: number;
  } } = {};

  filtrados.forEach(d => {
    const semana = d?.semana?.toString() || "Sin semana";
    const tonelada = this.toneladas.find(
      t => t.zona === d.zona && t.labor === d.labor
    );
    const toneladasVal = tonelada ? tonelada.toneladas : 0;

    if (!grupos[semana]) {
      grupos[semana] = { kg: 0, toneladas: 0, count: 0, registros: 0 };
    }
    grupos[semana].kg += d.kg_explosivos || 0;
    grupos[semana].toneladas += toneladasVal;
    grupos[semana].count += 1;
    grupos[semana].registros += 1;
  });

  const datosMuestra: any[] = [];
  let totalKgExplosivos = 0;
  let totalToneladas = 0;
  let totalKgPorTonelada = 0;
  let totalRegistrosSemanales = 0;
  let semanasValidas = 0;

  // Procesar semanas (igual que el gráfico)
  Object.keys(grupos).sort().forEach(semana => {
    const grupo = grupos[semana];
    if (grupo.count > 0) {
      const kgPorTonelada = grupo.toneladas > 0 ? 
        Number((grupo.kg / grupo.toneladas).toFixed(2)) : 0;
      
      datosMuestra.push([
        `Semana ${semana}`,
        grupo.kg.toLocaleString(),
        grupo.toneladas.toLocaleString(),
        kgPorTonelada,
        grupo.registros
      ]);

      totalKgExplosivos += grupo.kg;
      totalToneladas += grupo.toneladas;
      totalKgPorTonelada += kgPorTonelada;
      totalRegistrosSemanales += grupo.registros;
      semanasValidas++;
    }
  });

  // Calcular promedios generales (igual que el gráfico)
  const promedioKgExplosivos = semanasValidas > 0 ? 
    Number((totalKgExplosivos / semanasValidas).toFixed(2)) : 0;
  const promedioToneladas = semanasValidas > 0 ? 
    Number((totalToneladas / semanasValidas).toFixed(2)) : 0;
  const promedioKgPorTonelada = semanasValidas > 0 ? 
    Number((totalKgPorTonelada / semanasValidas).toFixed(2)) : 0;
  const promedioRegistros = semanasValidas > 0 ? 
    Number((totalRegistrosSemanales / semanasValidas).toFixed(1)) : 0;

  // Agregar fila de promedio (igual que el gráfico)
  if (semanasValidas > 0) {
    datosMuestra.push([
      'PROMEDIO',
      promedioKgExplosivos.toLocaleString(),
      promedioToneladas.toLocaleString(),
      promedioKgPorTonelada,
      promedioRegistros
    ]);
  }

  // Mensaje si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    semanasProcesadas: semanasValidas,
    promedioKgExplosivos,
    promedioToneladas,
    promedioKgPorTonelada,
    totalKgExplosivos,
    totalToneladas
  };
}

//GRAFICO 3 ---------------------------

mostrarInfoGrafico3(): void {
  const datosReales = this.calcularDatosDetalladosGrafico3();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Avance - Resumen Diario',
    descripcion: 'Este gráfico muestra el rendimiento promedio de explosivos por metro avanzado y el avance programado promedio, agrupado por días. Incluye un promedio general de todos los días analizados.',
    formula: 'Rendimiento (Kg/m) = Total Kg Explosivos / Total Avance Programado\nAvance Programado Promedio (m) = Total Avance Programado / Número de Registros',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Fecha', 'Explosivos (Kg)', 'Avance (m)', 'Rendimiento (Kg/m)', 'Registros', 'Avance Prom (m)'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0 y avance_programado > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      'Los promedios se calculan basados en días, no en registros individuales',
      `Total registros: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Días procesados: ${datosReales.diasProcesados}`,
      `Rendimiento promedio: ${datosReales.rendimientoPromedio} Kg/m`,
      `Avance promedio: ${datosReales.avancePromedio} m`,
      `Total explosivos: ${datosReales.totalExplosivos.toLocaleString()} Kg`,
      `Total avance: ${datosReales.totalAvance.toLocaleString()} m`
    ]
  };

  this.abrirDialog(dialogData);
}

private calcularDatosDetalladosGrafico3(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      diasProcesados: 0,
      rendimientoPromedio: 0,
      avancePromedio: 0,
      totalExplosivos: 0,
      totalAvance: 0
    };
  }

  // Aplicar mismo filtro que el gráfico
  const filtrados = this.datosOperaciones.filter(d => {
    const kg = d?.kg_explosivos ?? 0;
    const avance = d?.avance_programado ?? 0;
    return kg > 0 && avance > 0 && 
           (!d?.no_aplica || d.no_aplica === 0) && 
           (!d?.remanente || d.remanente === 0);
  });

  // Agrupar por fecha (misma lógica que el gráfico)
  const grupos: { [fecha: string]: { 
    kg: number; 
    avance: number; 
    count: number;
    registros: number;
  } } = {};
  
  filtrados.forEach(d => {
    const fecha = d?.fecha || "Sin fecha";
    if (!grupos[fecha]) {
      grupos[fecha] = { kg: 0, avance: 0, count: 0, registros: 0 };
    }
    grupos[fecha].kg += d?.kg_explosivos ?? 0;
    grupos[fecha].avance += d?.avance_programado ?? 0;
    grupos[fecha].count += 1;
    grupos[fecha].registros += 1;
  });

  const datosMuestra: any[] = [];
  let totalRendimiento = 0;
  let totalAvancePromedio = 0;
  let totalExplosivos = 0;
  let totalAvance = 0;
  let totalRegistrosDiarios = 0;
  let diasValidos = 0;

  // Ordenar fechas cronológicamente (igual que el gráfico)
  const fechasOrdenadas = Object.keys(grupos).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Procesar días (igual que el gráfico)
  fechasOrdenadas.forEach(fecha => {
    const grupo = grupos[fecha];
    if (grupo.avance > 0 && grupo.count > 0) {
      const rendimiento = Number((grupo.kg / grupo.avance).toFixed(2));
      const avancePromedio = Number((grupo.avance / grupo.count).toFixed(2));
      
      datosMuestra.push([
        this.formatDateToDDMMMYY(fecha), // Mismo formato que el gráfico
        grupo.kg.toLocaleString(),
        grupo.avance.toLocaleString(),
        rendimiento,
        grupo.registros,
        avancePromedio
      ]);

      totalRendimiento += rendimiento;
      totalAvancePromedio += avancePromedio;
      totalExplosivos += grupo.kg;
      totalAvance += grupo.avance;
      totalRegistrosDiarios += grupo.registros;
      diasValidos++;
    }
  });

  // Calcular promedios generales BASADOS EN DÍAS (igual que el gráfico)
  const rendimientoPromedio = diasValidos > 0 ? 
    Number((totalRendimiento / diasValidos).toFixed(2)) : 0;
  const avancePromedio = diasValidos > 0 ? 
    Number((totalAvancePromedio / diasValidos).toFixed(2)) : 0;
  const explosivosPromedio = diasValidos > 0 ? 
    Number((totalExplosivos / diasValidos).toFixed(2)) : 0;
  const avanceTotalPromedio = diasValidos > 0 ? 
    Number((totalAvance / diasValidos).toFixed(2)) : 0;
  const registrosPromedio = diasValidos > 0 ? 
    Number((totalRegistrosDiarios / diasValidos).toFixed(1)) : 0;

  // Agregar fila de promedio (igual que el gráfico)
  if (diasValidos > 0) {
    datosMuestra.push([
      'PROMEDIO',
      explosivosPromedio.toLocaleString(),
      avanceTotalPromedio.toLocaleString(),
      rendimientoPromedio,
      registrosPromedio,
      avancePromedio
    ]);
  }

  // Mensaje si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    diasProcesados: diasValidos,
    rendimientoPromedio,
    avancePromedio,
    totalExplosivos,
    totalAvance
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

//GRAFICO 4 ----------------------------

mostrarInfoGrafico4(): void {
  const datosReales = this.calcularDatosDetalladosGrafico4();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Explosivos vs Toneladas - Resumen Diario',
    descripcion: 'Este gráfico muestra la relación entre los kilogramos de explosivos utilizados y las toneladas producidas, agrupado por días. Incluye un promedio general de todos los días analizados.',
    formula: 'Kg Explosivos / Toneladas = Total Kg Explosivos / Total Toneladas\nPromedio Diario = Suma de valores / Número de días',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Fecha', 'Kg Explosivos', 'Toneladas', 'Kg Explosivos/Tonelada', 'Registros'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      'Las toneladas se obtienen de la tabla de toneladas por zona y labor',
      'Los promedios se calculan basados en días, no en registros individuales',
      `Total registros procesados: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Días procesados: ${datosReales.diasProcesados}`,
      `Promedio Kg Explosivos: ${datosReales.promedioKgExplosivos}`,
      `Promedio Toneladas: ${datosReales.promedioToneladas}`,
      `Promedio Kg/Tonelada: ${datosReales.promedioKgPorTonelada}`,
      `Total Kg Explosivos: ${datosReales.totalKgExplosivos.toLocaleString()} Kg`,
      `Total Toneladas: ${datosReales.totalToneladas.toLocaleString()} Tn`
    ]
  };

  this.abrirDialog(dialogData);
}

private calcularDatosDetalladosGrafico4(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      diasProcesados: 0,
      promedioKgExplosivos: 0,
      promedioToneladas: 0,
      promedioKgPorTonelada: 0,
      totalKgExplosivos: 0,
      totalToneladas: 0
    };
  }

  // Aplicar mismo filtro que el gráfico
  const filtrados = this.datosOperaciones.filter(d =>
    d.kg_explosivos &&
    d.labor &&
    d.labor.trim().toUpperCase().startsWith("TJ") && // 🔹 Solo labores que inician con "TJ"
    (!d.no_aplica || d.no_aplica === 0) &&
    (!d.remanente || d.remanente === 0)
  );


  // Agrupar por fecha (misma lógica que el gráfico)
  const grupos: { [fecha: string]: { 
    kg: number; 
    toneladas: number; 
    count: number;
    registros: number;
  } } = {};

  filtrados.forEach(d => {
    const fecha = d.fecha || "Sin fecha";
    const tonelada = this.toneladas.find(
      t => t.zona === d.zona && t.labor === d.labor
    );
    const toneladasVal = tonelada ? tonelada.toneladas : 0;

    if (!grupos[fecha]) {
      grupos[fecha] = { kg: 0, toneladas: 0, count: 0, registros: 0 };
    }
    grupos[fecha].kg += d.kg_explosivos || 0;
    grupos[fecha].toneladas += toneladasVal;
    grupos[fecha].count += 1;
    grupos[fecha].registros += 1;
  });

  const datosMuestra: any[] = [];
  let totalKgExplosivos = 0;
  let totalToneladas = 0;
  let totalKgPorTonelada = 0;
  let totalRegistrosDiarios = 0;
  let diasValidos = 0;

  // Ordenar fechas cronológicamente (igual que el gráfico)
  const fechasOrdenadas = Object.keys(grupos).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Procesar días (igual que el gráfico)
  fechasOrdenadas.forEach(fecha => {
    const grupo = grupos[fecha];
    if (grupo.count > 0) {
      const kgPorTonelada = grupo.toneladas > 0 ? 
        Number((grupo.kg / grupo.toneladas).toFixed(2)) : 0;
      
      datosMuestra.push([
        this.formatDateToDDMMMYY(fecha), // Mismo formato que el gráfico
        grupo.kg.toLocaleString(),
        grupo.toneladas.toLocaleString(),
        kgPorTonelada,
        grupo.registros
      ]);

      totalKgExplosivos += grupo.kg;
      totalToneladas += grupo.toneladas;
      totalKgPorTonelada += kgPorTonelada;
      totalRegistrosDiarios += grupo.registros;
      diasValidos++;
    }
  });

  // Calcular promedios generales BASADOS EN DÍAS (igual que el gráfico)
  const promedioKgExplosivos = diasValidos > 0 ? 
    Number((totalKgExplosivos / diasValidos).toFixed(2)) : 0;
  const promedioToneladas = diasValidos > 0 ? 
    Number((totalToneladas / diasValidos).toFixed(2)) : 0;
  const promedioKgPorTonelada = diasValidos > 0 ? 
    Number((totalKgPorTonelada / diasValidos).toFixed(2)) : 0;
  const promedioRegistros = diasValidos > 0 ? 
    Number((totalRegistrosDiarios / diasValidos).toFixed(1)) : 0;

  // Agregar fila de promedio (igual que el gráfico)
  if (diasValidos > 0) {
    const kgPorToneladaPromedio = totalToneladas > 0 ? 
      Number((totalKgExplosivos / totalToneladas).toFixed(2)) : 0;
    
    datosMuestra.push([
      'PROMEDIO',
      promedioKgExplosivos.toLocaleString(),
      promedioToneladas.toLocaleString(),
      kgPorToneladaPromedio, // Usar cálculo directo para el promedio general
      promedioRegistros
    ]);
  }

  // Mensaje si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    diasProcesados: diasValidos,
    promedioKgExplosivos,
    promedioToneladas,
    promedioKgPorTonelada,
    totalKgExplosivos,
    totalToneladas
  };
}

//GRAFICO 5 -------------------------------------

mostrarInfoGrafico5(): void {
  const datosReales = this.calcularDatosDetalladosGrafico5();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Avance - Detalle por Labor',
    descripcion: 'Este gráfico muestra el rendimiento de explosivos por metro avanzado y el avance programado para cada labor individual. Incluye un promedio general de todas las labores analizadas.',
    formula: 'Rendimiento (Kg/m) = Kg Explosivos / Avance Programado\nPromedio Rendimiento = Total Kg Explosivos / Total Avance Programado\nPromedio Avance = Total Avance Programado / Número de Labores',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Labor', 'Explosivos (Kg)', 'Avance (m)', 'Rendimiento (Kg/m)', 'Zona'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0 y avance_programado > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      'Cada fila representa una labor individual con sus datos específicos',
      `Total registros: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Labores procesadas: ${datosReales.laboresProcesadas}`,
      `Rendimiento promedio: ${datosReales.rendimientoPromedio} Kg/m`,
      `Avance promedio: ${datosReales.avancePromedio} m`,
      `Total explosivos: ${datosReales.totalExplosivos.toLocaleString()} Kg`,
      `Total avance: ${datosReales.totalAvance.toLocaleString()} m`
    ]
  };

  this.abrirDialog(dialogData);
}
private calcularDatosDetalladosGrafico5(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      laboresProcesadas: 0,
      rendimientoPromedio: 0,
      avancePromedio: 0,
      totalExplosivos: 0,
      totalAvance: 0
    };
  }

  // Aplicar mismo filtro que el gráfico
  const filtrados = this.datosOperaciones.filter(d =>
    d.kg_explosivos && d.avance_programado &&
    (!d.no_aplica || d.no_aplica === 0) &&
    (!d.remanente || d.remanente === 0)
  );

  const datosMuestra: any[] = [];
  let totalKgExplosivos = 0;
  let totalAvanceProgramado = 0;
  let laboresValidas = 0;

  // Procesar cada registro individualmente (igual que el gráfico)
  filtrados.forEach(d => {
    const rendimiento = d.avance_programado! > 0 ? 
      Number((d.kg_explosivos! / d.avance_programado!).toFixed(2)) : 0;
    
    datosMuestra.push([
      d.labor || 'Sin labor',
      (d.kg_explosivos || 0).toLocaleString(),
      (d.avance_programado || 0).toLocaleString(),
      rendimiento,
      d.zona || 'Sin zona'
    ]);

    totalKgExplosivos += d.kg_explosivos || 0;
    totalAvanceProgramado += d.avance_programado || 0;
    laboresValidas++;
  });

  // Calcular promedios generales (igual que el gráfico)
  const rendimientoPromedio = totalAvanceProgramado > 0 ? 
    Number((totalKgExplosivos / totalAvanceProgramado).toFixed(2)) : 0;
  const avancePromedio = laboresValidas > 0 ? 
    Number((totalAvanceProgramado / laboresValidas).toFixed(2)) : 0;

  // Agregar fila de promedio (igual que el gráfico)
  if (laboresValidas > 0) {
    datosMuestra.push([
      'PROMEDIO',
      Number((totalKgExplosivos / laboresValidas).toFixed(2)).toLocaleString(),
      avancePromedio.toLocaleString(),
      rendimientoPromedio,
      '-'
    ]);
  }

  // Mensaje si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    laboresProcesadas: laboresValidas,
    rendimientoPromedio,
    avancePromedio,
    totalExplosivos: totalKgExplosivos,
    totalAvance: totalAvanceProgramado
  };
}

//GRAFICO 6 --------------------------------------------
mostrarInfoGrafico6(): void {
  const datosReales = this.calcularDatosDetalladosGrafico6();
  
  const dialogData: DialogData = {
    titulo: 'Factor de Explosivos vs Toneladas - Detalle por Labor',
    descripcion: 'Este gráfico muestra la relación entre los kilogramos de explosivos utilizados y las toneladas producidas para cada labor individual. Incluye un promedio general de todas las labores analizadas.',
    formula: 'Kg Explosivos / Toneladas = Kg Explosivos / Toneladas\nPromedio Kg Explosivos = Total Kg Explosivos / Número de Labores\nPromedio Toneladas = Total Toneladas / Número de Labores\nPromedio Kg/Tonelada = Total Kg Explosivos / Total Toneladas',
    datosMuestra: datosReales.datosMuestra,
    columnas: ['Labor', 'Kg Explosivos', 'Toneladas', 'Kg Explosivos/Tonelada', 'Zona'],
    observaciones: [
      'Solo se consideran registros con kg_explosivos > 0',
      'Se excluyen registros marcados como no_aplica o remanente',
      'Las toneladas se obtienen de la tabla de toneladas por zona y labor',
      'Cada fila representa una labor individual con sus datos específicos',
      `Total registros procesados: ${datosReales.totalRegistros} | Válidos: ${datosReales.registrosValidos}`,
      `Labores procesadas: ${datosReales.laboresProcesadas}`,
      `Promedio Kg Explosivos: ${datosReales.promedioKgExplosivos}`,
      `Promedio Toneladas: ${datosReales.promedioToneladas}`,
      `Promedio Kg/Tonelada: ${datosReales.promedioKgPorTonelada}`,
      `Total Kg Explosivos: ${datosReales.totalKgExplosivos.toLocaleString()} Kg`,
      `Total Toneladas: ${datosReales.totalToneladas.toLocaleString()} Tn`
    ]
  };

  this.abrirDialog(dialogData);
}

private calcularDatosDetalladosGrafico6(): any {
  if (!this.datosOperaciones || this.datosOperaciones.length === 0) {
    return {
      datosMuestra: [['No hay datos disponibles', '-', '-', '-', '-']],
      totalRegistros: 0,
      registrosValidos: 0,
      laboresProcesadas: 0,
      promedioKgExplosivos: 0,
      promedioToneladas: 0,
      promedioKgPorTonelada: 0,
      totalKgExplosivos: 0,
      totalToneladas: 0
    };
  }

  // Aplicar mismo filtro que el gráfico (sin avance_programado)
  const filtrados = this.datosOperaciones.filter(d =>
    d.kg_explosivos &&
    d.labor &&
    d.labor.trim().toUpperCase().startsWith("TJ") && // 🔹 Solo labores que inician con "TJ"
    (!d.no_aplica || d.no_aplica === 0) &&
    (!d.remanente || d.remanente === 0)
  );


  const datosMuestra: any[] = [];
  let totalKgExplosivos = 0;
  let totalToneladas = 0;
  let laboresValidas = 0;

  // Procesar cada registro individualmente (igual que el gráfico)
  filtrados.forEach(d => {
    const tonelada = this.toneladas.find(
      t => t.zona === d.zona && t.labor === d.labor
    );
    const toneladasVal = tonelada ? tonelada.toneladas : 0;
    const kgPorTonelada = toneladasVal > 0 ? 
      Number(((d.kg_explosivos || 0) / toneladasVal).toFixed(2)) : 0;
    
    datosMuestra.push([
      d.labor || 'Sin labor',
      (d.kg_explosivos || 0).toLocaleString(),
      toneladasVal.toLocaleString(),
      kgPorTonelada,
      d.zona || 'Sin zona'
    ]);

    totalKgExplosivos += d.kg_explosivos || 0;
    totalToneladas += toneladasVal;
    laboresValidas++;
  });

  // Calcular promedios generales (igual que el gráfico)
  const promedioKgExplosivos = laboresValidas > 0 ? 
    Number((totalKgExplosivos / laboresValidas).toFixed(2)) : 0;
  const promedioToneladas = laboresValidas > 0 ? 
    Number((totalToneladas / laboresValidas).toFixed(2)) : 0;
  const promedioKgPorTonelada = totalToneladas > 0 ? 
    Number((totalKgExplosivos / totalToneladas).toFixed(2)) : 0;

  // Agregar fila de promedio (igual que el gráfico)
  if (laboresValidas > 0) {
    datosMuestra.push([
      'PROMEDIO',
      promedioKgExplosivos.toLocaleString(),
      promedioToneladas.toLocaleString(),
      promedioKgPorTonelada,
      '-'
    ]);
  }

  // Mensaje si no hay datos
  if (datosMuestra.length === 0) {
    datosMuestra.push(['No hay datos válidos para el cálculo', '-', '-', '-', '-']);
  }

  return {
    datosMuestra,
    totalRegistros: this.datosOperaciones.length,
    registrosValidos: filtrados.length,
    laboresProcesadas: laboresValidas,
    promedioKgExplosivos,
    promedioToneladas,
    promedioKgPorTonelada,
    totalKgExplosivos,
    totalToneladas
  };
}

  private abrirDialog(data: DialogData): void {
    this.dialog.open(CalculoDialogComponent, {
      width: '805px',
      maxWidth: '95vw',
      data: data,
      panelClass: 'calculo-dialog-panel'
    });
  }


}
