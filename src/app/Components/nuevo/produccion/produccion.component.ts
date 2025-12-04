import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlanProduccion } from '../../../models/plan_produccion.model';
import { MedicionesHorizontal } from '../../../models/MedicionesHorizontal';
import { NubeOperacion } from '../../../models/operaciones.models';
import { TooltipLaborComponent } from "../Avance/tooltip-labor/tooltip-labor.component";

interface LaborFila {
  proceso: string;
  zona: string;
  labor: string;
  programado: number;
  real: number;
  ancho: number;
  alto: number;

  // 🔹 Datos para tooltip (igual que en ZonaComponent)
  anchoReal?: number;     // Ejecutado (si lo manejas en Producción)
  altoReal?: number;      // Ejecutado
  fechaUltima?: string | null;
  turnoUltimo?: string | null;

  color?: string;
}

interface ZonaAgrupada {
  nombre: string;
  labores: LaborFila[];
}

type EventoTipo = 'PERFORADO' | 'DISPARADA' | 'LIMPIEZA' | 'ACARREO' | 'SOSTENIMIENTO';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, TooltipLaborComponent],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.css'
})
export class ProduccionComponent implements OnChanges {
  @Input() Produccion: PlanProduccion[] = [];
  @Input() mediciones: MedicionesHorizontal[] = [];

  @Input() operacionesLargo: NubeOperacion[] = [];
  @Input() operacionesSostenimiento: NubeOperacion[] = [];

  estadoColorMap: Record<string, string> = {
    'PERFORADO': '#4caf50',
    'DISPARADA': '#f44336',
    'LIMPIEZA': '#ff9800',
    'ACARREO': '#2196f3',
    'SOSTENIMIENTO': '#9c27b0'
  };

  // Orden de la línea de trabajo
  etapasOrden: EventoTipo[] = ['PERFORADO', 'DISPARADA', 'LIMPIEZA', 'ACARREO', 'SOSTENIMIENTO'];

  // Estructura simple de zonas
  zonasAgrupadas: ZonaAgrupada[] = [];
  expandido: { [clave: string]: boolean } = {};

  // Tooltip
  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['Produccion'] || 
      changes['mediciones'] || 
      changes['operacionesLargo'] || 
      changes['operacionesSostenimiento']
    ) {
      console.log('🔄 [ProduccionComponent] ngOnChanges → reconstruir estructura');
      this.construirEstructura();
    }
  }

  mostrarTooltip(event: MouseEvent, labor: any) {
    this.tooltipVisible = true;
    this.tooltipLabor = labor;
    this.tooltipX = event.clientX + 15;
    this.tooltipY = event.clientY + 15;
  }

  ocultarTooltip() {
    this.tooltipVisible = false;
  }

  /** Normaliza el nombre de la labor para poder comparar:
   *  - trim
   *  - pasa a mayúsculas
   *  - colapsa espacios múltiples a un solo espacio
   */
  private normalizarLabor(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  // ---------- Helpers de fechas ----------
  private normalizeDateToYMD(dateStr: string | undefined | null): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  }

  // ---------- Eventos por labor ----------
  private getEventosParaLabor(laborKey: string): { tipo: EventoTipo; fecha: string }[] {
    const eventos: { tipo: EventoTipo; fecha: string }[] = [];

    // 1) Mediciones -> DISPARADA
    for (const med of this.mediciones) {
      const laborMed = (med.labor ?? '').toString().trim();
      if (!laborMed || laborMed !== laborKey) continue;
      const f = this.normalizeDateToYMD(med.fecha ?? '');
      if (!f) continue;
      eventos.push({ tipo: 'DISPARADA', fecha: f });
    }

    // 2) Operaciones de LARGO -> PERFORADO + LIMPIEZA + ACARREO
    for (const op of this.operacionesLargo ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      // PERFORADO (perforaciones largas)
      for (const pl of op.perforaciones ?? []) {
        const laborOp = [
          pl.tipo_labor,
          pl.labor
        ]
          .filter(v => v && v.toString().trim() !== '')
          .join(' ')
          .trim();

        if (laborOp === laborKey) {
          eventos.push({ tipo: 'PERFORADO', fecha: fechaOp });
        }
      }

      // Estados que pueden representar LIMPIEZA / ACARREO
      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const pl of op.perforaciones ?? []) {
            const laborOp = [
              pl.tipo_labor,
              pl.labor
            ]
              .filter(v => v && v.toString().trim() !== '')
              .join(' ')
              .trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'LIMPIEZA', fecha: fechaSt });
            }
          }
        }

        if (estadoTxt.includes('acarreo') || estadoTxt.includes('cargu')) {
          for (const pl of op.perforaciones ?? []) {
            const laborOp = [
              pl.tipo_labor,
              pl.labor
            ]
              .filter(v => v && v.toString().trim() !== '')
              .join(' ')
              .trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
            }
          }
        }
      }
    }

    // 3) Operaciones sostenimiento -> SOSTENIMIENTO + LIMPIEZA + ACARREO
    for (const op of this.operacionesSostenimiento ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      // SOSTENIMIENTO
      for (const s of op.sostenimientos ?? []) {
        const laborOp = [
          s.tipo_labor,
          s.labor
        ]
          .filter(v => v && v.toString().trim() !== '')
          .join(' ')
          .trim();

        if (laborOp === laborKey) {
          eventos.push({ tipo: 'SOSTENIMIENTO', fecha: fechaOp });
        }
      }

      // LIMPIEZA / ACARREO asociados a sostenimiento
      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const s of op.sostenimientos ?? []) {
            const laborOp = [
              s.tipo_labor,
              s.labor
            ]
              .filter(v => v && v.toString().trim() !== '')
              .join(' ')
              .trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'LIMPIEZA', fecha: fechaSt });
            }
          }
        }

        if (estadoTxt.includes('acarreo') || estadoTxt.includes('cargu')) {
          for (const s of op.sostenimientos ?? []) {
            const laborOp = [
              s.tipo_labor,
              s.labor
            ]
              .filter(v => v && v.toString().trim() !== '')
              .join(' ')
              .trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
            }
          }
        }
      }
    }

    // Ordenamos por fecha ascendente y luego por etapa (según etapasOrden)
    eventos.sort((a, b) => {
      if (a.fecha < b.fecha) return -1;
      if (a.fecha > b.fecha) return 1;
      // misma fecha -> por orden de etapa
      return this.etapasOrden.indexOf(a.tipo) - this.etapasOrden.indexOf(b.tipo);
    });

    console.log(`📌 [getEventosParaLabor] Labor "${laborKey}" → eventos ordenados:`, eventos);
    return eventos;
  }

  /**
   * A partir de todos los eventos de la labor:
   * 1. Buscar el último PERFORADO (fecha más reciente).
   * 2. Tomar todos los eventos desde ese PERFORADO hacia adelante (>= fechaPerforado).
   * 3. De esos, devolver la etapa más avanzada.
   */
  private decidirEtapaSegunLineaTrabajo(
    eventos: { tipo: EventoTipo; fecha: string }[]
  ): EventoTipo | null {
    if (!eventos.length) return null;

    // Buscar el último PERFORADO (fecha más reciente)
    const perforados = eventos.filter(e => e.tipo === 'PERFORADO');
    if (!perforados.length) {
      console.log('⚠️ [decidirEtapaSegunLineaTrabajo] No hay PERFORADO → null');
      return null;
    }

    const ultimoPerforado = perforados.reduce(
      (prev, curr) => (curr.fecha > prev.fecha ? curr : prev),
      perforados[0]
    );
    console.log('🟢 [decidirEtapaSegunLineaTrabajo] último PERFORADO:', ultimoPerforado);

    // Tomar todos los eventos desde el último PERFORADO
    const desdePerforado = eventos.filter(e => e.fecha >= ultimoPerforado.fecha);
    if (!desdePerforado.length) return 'PERFORADO';

    // Elegir la etapa más avanzada
    let mejor: EventoTipo = 'PERFORADO';
    for (const e of desdePerforado) {
      if (this.etapasOrden.indexOf(e.tipo) > this.etapasOrden.indexOf(mejor)) {
        mejor = e.tipo;
      }
    }

    console.log('✅ [decidirEtapaSegunLineaTrabajo] etapa final elegida:', mejor, 'con eventos:', desdePerforado);
    return mejor;
  }

  // ---------- Color final para la labor ----------
  private getColorParaLabor(laborKey: string): string {
    const eventos = this.getEventosParaLabor(laborKey);

    if (!eventos.length) {
      console.log(`⚪ [getColorParaLabor] Labor "${laborKey}" sin eventos → gris`);
      return '#bdbdbd';
    }

    const etapaFinal = this.decidirEtapaSegunLineaTrabajo(eventos);

    if (!etapaFinal) {
      console.log(`⚪ [getColorParaLabor] Labor "${laborKey}" sin etapa final → gris`);
      return '#bdbdbd';
    }

    const color = this.estadoColorMap[etapaFinal] ?? '#bdbdbd';
    console.log(`🎨 [getColorParaLabor] Labor "${laborKey}" → etapaFinal="${etapaFinal}", color="${color}"`);
    return color;
  }

  // ---------- Construcción de estructura principal ----------
  private construirEstructura(): void {
    this.expandido = {};
    console.log('🔧 [construirEstructura] Inicio');

    // 0. Crear un mapa laborNormalizada -> suma de toneladas (REAL)
    const realPorLabor: Record<string, number> = {};
    const ultimaMedicionPorLabor: Record<string, MedicionesHorizontal> = {};

    this.mediciones.forEach(med => {
      if (!med.labor) return;

      // Para REAL usamos clave normalizada (toneladas)
      const laborKeyNorm = this.normalizarLabor(med.labor);
      if (!laborKeyNorm) return;

      const toneladas = med.toneladas ?? 0;
      if (!realPorLabor[laborKeyNorm]) {
        realPorLabor[laborKeyNorm] = 0;
      }
      realPorLabor[laborKeyNorm] += toneladas;

      // Para tooltip (fecha, turno, ancho/alto) guardamos por labor "visible" (sin normalizar)
      const laborVisible = med.labor.toString().trim();
      if (!laborVisible) return;

      const actual = ultimaMedicionPorLabor[laborVisible];
      const fechaNueva = med.fecha ?? '';
      const idNuevo = med.id ?? 0;

      if (!actual) {
        ultimaMedicionPorLabor[laborVisible] = med;
      } else {
        const fechaActual = actual.fecha ?? '';
        const idActual = actual.id ?? 0;
        if (fechaNueva > fechaActual) {
          ultimaMedicionPorLabor[laborVisible] = med;
        } else if (fechaNueva === fechaActual && idNuevo > idActual) {
          ultimaMedicionPorLabor[laborVisible] = med;
        }
      }
    });

    console.log('📊 [construirEstructura] realPorLabor:', realPorLabor);
    console.log('📊 [construirEstructura] ultimaMedicionPorLabor:', ultimaMedicionPorLabor);

    // 1. Convertimos cada PlanProduccion en una fila "normalizada"
    const filas: LaborFila[] = this.Produccion.map(item => {
      const proceso = 'Largo';

      // labor visible = tipo_labor + labor + ala (como la ve el usuario)
      const laborNombreVisible = [
        item.tipo_labor,
        item.labor,
        item.ala
      ]
        .filter(v => v && v.toString().trim() !== '')
        .join(' ')
        .trim();

      // clave normalizada para buscar en el mapa de toneladas
      const laborKeyNorm = this.normalizarLabor(laborNombreVisible || '');

      // REAL desde mediciones: suma de toneladas por labor normalizada
      const real = laborKeyNorm && realPorLabor[laborKeyNorm]
        ? realPorLabor[laborKeyNorm]
        : 0;

      // Para tooltip: buscar la última medición por labor visible
      const ultima = laborNombreVisible ? ultimaMedicionPorLabor[laborNombreVisible] : undefined;

      let anchoReal = 0;
      let altoReal = 0;
      let fechaUltima: string | null = null;
      let turnoUltimo: string | null = null;

      if (ultima) {
        anchoReal = ultima.ancho ?? 0;
        altoReal = ultima.alto ?? 0;
        fechaUltima = ultima.fecha ?? null;
        turnoUltimo = ultima.turno ?? null;
      }

      // Color según línea PERFORADO → DISPARADA → LIMPIEZA → ACARREO → SOSTENIMIENTO
      const color = laborNombreVisible ? this.getColorParaLabor(laborNombreVisible) : '#bdbdbd';

      const fila: LaborFila = {
        proceso,
        zona: item.zona || 'SIN ZONA',
        labor: laborNombreVisible || 'SIN LABOR',
        programado: (item.cut_off_2 as number) ?? 0,
        real,
        ancho: 0,
        alto: 0,
        anchoReal,
        altoReal,
        fechaUltima,
        turnoUltimo,
        color
      };

      console.log('🧱 [construirEstructura] LaborFila creada:', fila);
      return fila;
    });

    // 2. Agrupamos directamente por zona
    const agrupadoPorZona: Record<string, LaborFila[]> = {};

    filas.forEach(fila => {
      if (!agrupadoPorZona[fila.zona]) {
        agrupadoPorZona[fila.zona] = [];
      }
      agrupadoPorZona[fila.zona].push(fila);
    });

    // 🔥 Ordenar las labores dentro de cada zona (con color primero)
    Object.keys(agrupadoPorZona).forEach(zona => {
      agrupadoPorZona[zona].sort((a, b) => {
        const aTieneColor = a.color !== '#bdbdbd';
        const bTieneColor = b.color !== '#bdbdbd';

        if (aTieneColor && !bTieneColor) return -1;
        if (!aTieneColor && bTieneColor) return 1;

        return 0;
      });
    });

    // 3. Convertimos a arreglo para usarlo en el HTML
    this.zonasAgrupadas = Object.keys(agrupadoPorZona).map(zona => ({
      nombre: zona,
      labores: agrupadoPorZona[zona]
    }));

    // 4. Dejamos todo expandido por defecto
    this.zonasAgrupadas.forEach(z => {
      this.expandido[z.nombre] = true;
    });

    console.log('📦 [construirEstructura] zonasAgrupadas:', this.zonasAgrupadas);
    console.log('✅ [construirEstructura] Fin');
  }

  toggleExpand(zona: string) {
    this.expandido[zona] = !this.expandido[zona];
  }

  getPorcentaje(real: number, programado: number): number {
    return programado > 0 ? (real / programado) * 100 : 0;
  }

  calcularResumen(labores: LaborFila[]) {
    const resumen: Record<string, { real: number; programado: number }> = {};

    labores.forEach(l => {
      if (!resumen[l.labor]) {
        resumen[l.labor] = { real: 0, programado: 0 };
      }
      resumen[l.labor].real += l.real;
      resumen[l.labor].programado += l.programado;
    });

    ['Ancho', 'Alto', 'Avance'].forEach(key => {
      if (!resumen[key]) resumen[key] = { real: 0, programado: 0 };
    });

    return resumen;
  }
}
