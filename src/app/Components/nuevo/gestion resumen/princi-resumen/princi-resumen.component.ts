import { Component, OnInit } from '@angular/core';
import { ZonaComponent } from "../zona/zona.component";
import { LeyendaComponent } from "../leyenda/leyenda.component";
import { CommonModule } from '@angular/common';
import { ProduccionComponent } from '../produccion/produccion.component';
import { FechasPlanMensualService } from '../../../../services/fechas-plan-mensual.service';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { OperacionService } from '../../../../services/OperacionService .service';
import { ToneladasService } from '../../../../services/toneladas.service';
import { ExplosivoService } from '../../../../services/explosivo.service';
import { NubeDatosTrabajoExploracionesService } from '../../../../services/nube-datos-trabajo-exploraciones.service';
import { MedicionesHorizontalProgramadoService } from '../../../../services/mediciones-horizontal-programado.service';
import { PlanMensualService } from '../../../../services/plan-mensual.service';
import { Explosivo } from '../../../../models/Explosivo';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { Tonelada } from '../../../../models/tonelada';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { NubeDatosTrabajoExploraciones } from '../../../../models/nube-datos-trabajo-exploraciones';
import { NubeOperacion } from '../../../../models/operaciones.models';

type PlanType = 'avance' | 'metraje' | 'produccion';

@Component({
  selector: 'app-princi-resumen',
  imports: [ZonaComponent, LeyendaComponent, CommonModule, ProduccionComponent],
  templateUrl: './princi-resumen.component.html',
  styleUrl: './princi-resumen.component.css'
})
export class PrinciResumenComponent implements OnInit {

  constructor(
    private fechasPlanMensualService: FechasPlanMensualService,
    private planProduccionService: PlanProduccionService,
    private planMensualService: PlanMensualService,
    private medicionesService: MedicionesHorizontalProgramadoService,
    private exploracionesService: NubeDatosTrabajoExploracionesService,
    private explosivoService: ExplosivoService,
    private toneladasService: ToneladasService,
    private operacionService: OperacionService, 
  ) {}

  ngOnInit(): void {
    this.obtenerUltimaFecha();
    this.obtenerExplosivos();
    this.obtenerToneladas();
  }

  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;

  Avance: PlanMensual[] = [];
  explosivos: Explosivo[] = [];
  toneladas: Tonelada[] = [];
  medicionesHorizontales: MedicionesHorizontal[] = [];
  medicionesProceso: MedicionesHorizontal[] = [];
  Produccion: PlanProduccion[] = [];
 exploraciones: NubeDatosTrabajoExploraciones[] = [];

 operacionesLargoPlan: NubeOperacion[] = [];
  operacionesHorizontalPlan: NubeOperacion[] = [];
  operacionesSostenimientoPlan: NubeOperacion[] = [];

  // 👇 esto alimenta tu <select>
  zonas: { zona: string }[] = [];
sumaToneladas: number = 0;
  zonaSeleccionada = 'todas';
  planActivo: PlanType = 'avance';

  // 👉 función para combinar zonas de Avance y Producción
  private actualizarZonas(): void {
    const zonasAvance = this.Avance
      .map(a => a.zona)
      .filter(z => !!z) as string[];

    const zonasProduccion = this.Produccion
      .map(p => p.zona)
      .filter(z => !!z) as string[];

    const zonasUnicas = Array.from(new Set([...zonasAvance, ...zonasProduccion]));

    this.zonas = zonasUnicas.map(z => ({ zona: z }));
  }

  get mesAnio(): string {
    if (this.mes && this.anio) {
      return `${this.mes} ${this.anio}`;
    }
    if (this.mes) {
      return this.mes;
    }
    if (this.anio) {
      return this.anio.toString();
    }
    return 'Mes año';
  }

  cambiarPlan(plan: PlanType): void {
    this.planActivo = plan;
  }

  esPlanActivo(plan: PlanType): boolean {
    return this.planActivo === plan;
  }

  obtenerComponenteActual(): any {
    switch (this.planActivo) {
      case 'avance':
        return ZonaComponent;
      // case 'metraje':
      //   return MetrajeComponent;
      case 'produccion':
        return ProduccionComponent;
      default:
        return ZonaComponent;
    }
  }

    obtenerToneladas() {
  this.toneladasService.getToneladas().subscribe({
    next: (data) => {
      this.toneladas = data;
      console.log('✅ Toneladas recibidas:', this.toneladas);
    },
    error: (err) => {
      console.error('🚫 Error al obtener toneladas:', err);
      this.errorMessage = 'Error al cargar toneladas.';
    }
  });
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

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;

        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase();

          // ⬇️ aquí llamas a las dos
          this.obtenerPlanesMensualesAvance(anio, this.mes);
          this.obtenerPlanesProduccion(anio, this.mes);
          this.obtenerMedicionesHorizontales(anio, this.mes);
          this.obtenerExploraciones(anio, this.mes);

          this.obtenerOperacionesLargoPlan(anio, this.mes);
        this.obtenerOperacionesHorizontalPlan(anio, this.mes);
        this.obtenerOperacionesSostenimientoPlan(anio, this.mes);

        }
      },
      (error) => {
        // manejo error
      }
    );
  }

obtenerOperacionesLargoPlan(anio: number, mes: string): void {
  console.log(`🔍 Consultando operaciones LARGO plan: mes=${mes}, año=${anio}`);

  this.operacionService
    .getOperacionesLargoPlan(mes, anio)
    .subscribe({
      next: (data: NubeOperacion[]) => {
        this.operacionesLargoPlan = data;
        console.log('✅ Operaciones Largo Plan:', this.operacionesLargoPlan);
      },
      error: (err) => {
        console.error('❌ Error al obtener operaciones largo plan:', err);
        this.operacionesLargoPlan = [];
      }
    });
}

obtenerOperacionesHorizontalPlan(anio: number, mes: string): void {
  console.log(`🔍 Consultando operaciones HORIZONTAL plan: mes=${mes}, año=${anio}`);

  this.operacionService
    .getOperacionesHorizontalPlan(mes, anio)
    .subscribe({
      next: (data: NubeOperacion[]) => {
        this.operacionesHorizontalPlan = data;
        console.log('✅ Operaciones Horizontal Plan:', this.operacionesHorizontalPlan);
      },
      error: (err) => {
        console.error('❌ Error al obtener operaciones horizontal plan:', err);
        this.operacionesHorizontalPlan = [];
      }
    });
}

obtenerOperacionesSostenimientoPlan(anio: number, mes: string): void {
  console.log(`🔍 Consultando operaciones SOSTENIMIENTO plan: mes=${mes}, año=${anio}`);

  this.operacionService
    .getOperacionesSostenimientoPlan(mes, anio)
    .subscribe({
      next: (data: NubeOperacion[]) => {
        this.operacionesSostenimientoPlan = data;
        console.log('✅ Operaciones Sostenimiento Plan:', this.operacionesSostenimientoPlan);
      },
      error: (err) => {
        console.error('❌ Error al obtener operaciones sostenimiento plan:', err);
        this.operacionesSostenimientoPlan = [];
      }
    });
}

  obtenerPlanesMensualesAvance(anio: number, mes: string): void {
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
      (planes) => {
        this.Avance = planes;
        this.actualizarZonas();   // 👈 ACTUALIZAR ZONAS
      },
      (error) => {}
    );
  }

  obtenerPlanesProduccion(anio: number, mes: string): void {
    this.planProduccionService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
      (planes) => {
        this.Produccion = planes;
        this.actualizarZonas();   // 👈 ACTUALIZAR ZONAS
      },
      (error) => {}
    );
  }

  obtenerMedicionesHorizontales(anio: number, mes: string): void {
  this.medicionesService.getMedicionesPorFecha(mes, anio).subscribe(
    (data: MedicionesHorizontal[]) => {
      this.medicionesHorizontales = data;
      console.log('MedicionesHorizontales:', this.medicionesHorizontales);
    },
    (error) => {
      console.error('Error obteniendo mediciones horizontales:', error);
      this.medicionesHorizontales = [];
    }
  );
}

obtenerExploraciones(anio?: number, mes?: string): void {
  console.log(
    `🔍 Consultando exploraciones por fecha: mes=${mes}, año=${anio}`
  );

  this.exploracionesService
    .getExploracionesPorFecha(mes, anio)
    .subscribe({
      next: (data) => {
        this.exploraciones = data;
        console.log('✅ Exploraciones obtenidas:', this.exploraciones);
        this.procesarExploraciones();
      },
      error: (err) => {
        console.error('❌ Error al obtener exploraciones:', err);
      }
    });
}

procesarExploraciones(): void {
  const datosFormateados: MedicionesHorizontal[] = [];

  // 1️⃣ Primero: construir claves y contar cuántos registros hay por (labor, fecha)
  const conteoPorClave: Record<string, number> = {};

  this.exploraciones.forEach((registro) => {
    const laborVisual = `${registro.tipo_labor ?? ''} ${registro.labor ?? ''} ${registro.ala ?? ''}`.trim();
    const laborRegistro = laborVisual.toLowerCase();
    const fecha = registro.fecha;

    // si también quieres diferenciar por zona, agrégala a la clave
    const zona = registro.zona ?? '';
    const clave = `${laborRegistro}||${zona}||${fecha}`;

    conteoPorClave[clave] = (conteoPorClave[clave] || 0) + 1;
  });

  // 2️⃣ Ahora sí, recorrer de nuevo y calcular totales + toneladas ajustadas
  this.exploraciones.forEach((registro) => {
    let totalKg = 0;

    const despachosTotales: Record<string, number> = {};
    const devolucionesTotales: Record<string, number> = {};

    (registro.despachos || []).forEach(d =>
      (d.detalles || []).forEach(detalle => {
        const nombre = detalle.nombre_material;
        const cantidad = Number(detalle.cantidad) || 0;
        despachosTotales[nombre] = (despachosTotales[nombre] || 0) + cantidad;
      })
    );

    (registro.devoluciones || []).forEach(d =>
      (d.detalles || []).forEach(detalle => {
        const nombre = detalle.nombre_material;
        const cantidad = Number(detalle.cantidad) || 0;
        devolucionesTotales[nombre] = (devolucionesTotales[nombre] || 0) + cantidad;
      })
    );

    Object.entries(despachosTotales).forEach(([nombre, cantidadDespacho]) => {
      const cantidadDevolucion = devolucionesTotales[nombre] || 0;
      const diferencia = cantidadDespacho - cantidadDevolucion;
      const explosivo = this.explosivos.find(e => e.tipo_explosivo === nombre);
      if (explosivo) totalKg += diferencia * explosivo.peso_unitario;
    });

    const laborVisual = `${registro.tipo_labor ?? ''} ${registro.labor ?? ''} ${registro.ala ?? ''}`.trim();
    const laborRegistro = laborVisual.toLowerCase();
    const fecha = registro.fecha;
    const zona = registro.zona ?? '';

    // 🔑 misma clave que arriba
    const clave = `${laborRegistro}||${zona}||${fecha}`;
    const cantidadRegistros = conteoPorClave[clave] || 1;

    // Buscar tonelada de esa labor+fecha
    const toneladaEncontrada = this.toneladas.find(t =>
      t.labor?.trim().toLowerCase() === laborRegistro &&
      t.fecha === fecha
      // si quieres considerar zona también:
      // && (t.zona ?? '').toLowerCase() === zona.toLowerCase()
    );

    let toneladasValor = 0;
    if (toneladaEncontrada) {
      // 🔹 repartimos la tonelada entre los registros que coinciden
      toneladasValor = Number((toneladaEncontrada.toneladas / cantidadRegistros).toFixed(3));
    }

    // --- Ajuste de fecha ---
    const nuevaFecha = new Date(registro.fecha);
    if (registro.turno?.toLowerCase() === 'noche') {
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    }

    const semanaLimpia =
      registro.semanaSelect?.toString().replace(/semana\s*/i, '').trim() || '';

    const medicion: MedicionesHorizontal = {
      fecha: registro.fecha,
      turno: registro.turno,
      empresa: registro.empresa,
      zona: registro.zona,
      labor: laborVisual,
      veta: registro.veta,
      tipo_perforacion: registro.tipo_perforacion,
      kg_explosivos: Number(totalKg.toFixed(2)),
      toneladas: Number(toneladasValor.toFixed(3)),             // 👈 ya viene “repartida”
      avance_programado: null,
      ancho: null,
      alto: null,
      envio: registro.envio ?? 0,
      id_explosivo: registro.id ?? null,
      idnube: registro.id ?? null,
      no_aplica: 0,
      remanente: 0,
      semana: semanaLimpia,
      fechaAjustada: nuevaFecha.toISOString().split('T')[0]
    };

    datosFormateados.push(medicion);
  });

  this.medicionesProceso = datosFormateados;
  console.log("✅ Mediciones formateadas con toneladas (repartidas):", this.medicionesProceso);
}

}
