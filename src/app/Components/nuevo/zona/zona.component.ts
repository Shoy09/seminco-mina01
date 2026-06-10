import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlanMensual } from '../../../models/plan-mensual.model';
import { MedicionesHorizontal } from '../../../models/MedicionesHorizontal';
import { NubeOperacion } from '../../../models/operaciones.models';
import { TooltipLaborComponent } from '../Dialog/tooltip-labor/tooltip-labor.component';

interface LaborFila {
  proceso: string;
  zona: string;
  labor: string;
  programado: number;
  real: number;
  ancho: number;
  alto: number;
  anchoReal: number;  // Ejecutado
  altoReal: number;   // Ejecutado
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
  selector: 'app-zona',
  standalone: true,
  imports: [CommonModule, TooltipLaborComponent],
  templateUrl: './zona.component.html',
  styleUrl: './zona.component.css'
})
export class ZonaComponent implements OnChanges {
  @Input() avance: PlanMensual[] = [];
  @Input() mediciones: MedicionesHorizontal[] = [];

  @Input() operacionesHorizontal: NubeOperacion[] = [];
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

  zonasAgrupadas: ZonaAgrupada[] = [];
  expandido: { [clave: string]: boolean } = {};

  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['avance'] ||
      changes['mediciones'] ||
      changes['operacionesHorizontal'] ||
      changes['operacionesSostenimiento']
    ) {
      console.log('🔄 [ZonaComponent] ngOnChanges → reconstruir estructura');
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

    // 2) Operaciones horizontales -> PERFORADO + LIMPIEZA + ACARREO
    for (const op of this.operacionesHorizontal ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      // PERFORADO (perforaciones horizontales)
      for (const ph of op.perforaciones_horizontal ?? []) {
        const laborOp = [
          ph.tipo_labor,
          ph.labor
          // + ph.ala cuando exista
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
          for (const ph of op.perforaciones_horizontal ?? []) {
            const laborOp = [
              ph.tipo_labor,
              ph.labor
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
          for (const ph of op.perforaciones_horizontal ?? []) {
            const laborOp = [
              ph.tipo_labor,
              ph.labor
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
   * 3. De esos, devolver la etapa más avanzada (según PERFORADO→DISPARADA→LIMPIEZA→ACARREO→SOSTENIMIENTO).
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

  const ultimoPerforado = perforados.reduce((prev, curr) => (curr.fecha > prev.fecha ? curr : prev), perforados[0]);
  console.log('🟢 [decidirEtapaSegunLineaTrabajo] último PERFORADO:', ultimoPerforado);

  // Tomar todos los eventos desde el último PERFORADO
  const desdePerforado = eventos.filter(e => e.fecha >= ultimoPerforado.fecha);
  if (!desdePerforado.length) return 'PERFORADO';

  // Elegir la etapa más avanzada según la línea de trabajo
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

  const realPorLabor: Record<string, number> = {};
  const ultimaMedicionPorLabor: Record<string, MedicionesHorizontal> = {};

  // Agrupar mediciones (código existente...)
  this.mediciones.forEach(med => {
    if (!med.labor) return;
    const laborKey = med.labor.toString().trim();
    if (!laborKey) return;

    const avanceReal = med.avance_programado ?? 0;
    if (!realPorLabor[laborKey]) realPorLabor[laborKey] = 0;
    realPorLabor[laborKey] += avanceReal;

    const actual = ultimaMedicionPorLabor[laborKey];
    const fechaNueva = med.fecha ?? '';
    const idNuevo = med.id ?? 0;

    if (!actual) {
      ultimaMedicionPorLabor[laborKey] = med;
    } else {
      const fechaActual = actual.fecha ?? '';
      const idActual = actual.id ?? 0;
      if (fechaNueva > fechaActual) {
        ultimaMedicionPorLabor[laborKey] = med;
      } else if (fechaNueva === fechaActual && idNuevo > idActual) {
        ultimaMedicionPorLabor[laborKey] = med;
      }
    }
  });

  console.log('📊 [construirEstructura] realPorLabor:', realPorLabor);
  console.log('📊 [construirEstructura] ultimaMedicionPorLabor:', ultimaMedicionPorLabor);

  const filas: LaborFila[] = this.avance.map(item => {
    const laborNombre = [
      item.tipo_labor,
      item.labor,
      item.ala
    ]
      .filter(v => v && v.toString().trim() !== '')
      .join(' ')
      .trim();

    const laborKey = laborNombre;

    const real = laborKey && realPorLabor[laborKey] ? realPorLabor[laborKey] : 0;

    let anchoReal = 0;
    let altoReal = 0;
    let fechaUltima: string | null = null;
    let turnoUltimo: string | null = null;

    const ultima = laborKey ? ultimaMedicionPorLabor[laborKey] : undefined;
    if (ultima) {
      anchoReal = ultima.ancho ?? 0;
      altoReal = ultima.alto ?? 0;
      fechaUltima = ultima.fecha ?? null;
      turnoUltimo = ultima.turno ?? null;
    }

    // Color según la línea PERFORADO → DISPARADA → LIMPIEZA → ACARREO → SOSTENIMIENTO
    const color = laborKey ? this.getColorParaLabor(laborKey) : '#bdbdbd';

    const proceso = 'Horizontal';

    const fila: LaborFila = {
      proceso,
      zona: item.zona || 'SIN ZONA',
      labor: laborNombre || 'SIN LABOR',
      programado: item.avance_m ?? 0,
      real,
      ancho: item.ancho_m ?? 0,
      alto: item.alto_m ?? 0,
      anchoReal,
      altoReal,
      fechaUltima,
      turnoUltimo,
      color
    };

    console.log('🧱 [construirEstructura] LaborFila creada:', fila);
    return fila;
  });

  const agrupadoPorZona: Record<string, LaborFila[]> = {};
  filas.forEach(fila => {
    if (!agrupadoPorZona[fila.zona]) agrupadoPorZona[fila.zona] = [];
    agrupadoPorZona[fila.zona].push(fila);
  });

  // 🔥 NUEVO: Ordenar las labores dentro de cada zona
  Object.keys(agrupadoPorZona).forEach(zona => {
    agrupadoPorZona[zona].sort((a, b) => {
      // Primero: labores con color vs gris (#bdbdbd)
      const aTieneColor = a.color !== '#bdbdbd';
      const bTieneColor = b.color !== '#bdbdbd';
      
      if (aTieneColor && !bTieneColor) return -1; // 'a' con color primero
      if (!aTieneColor && bTieneColor) return 1;  // 'b' con color primero
      
      // Si ambos tienen color o ambos son gris, mantener orden original
      return 0;
    });
  });

  this.zonasAgrupadas = Object.keys(agrupadoPorZona).map(z => ({
    nombre: z,
    labores: agrupadoPorZona[z]
  }));

  console.log('📦 [construirEstructura] zonasAgrupadas:', this.zonasAgrupadas);

  this.zonasAgrupadas.forEach(z => {
    this.expandido[z.nombre] = true;
  });

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
      if (!resumen[l.labor]) resumen[l.labor] = { real: 0, programado: 0 };
      resumen[l.labor].real += l.real;
      resumen[l.labor].programado += l.programado;
    });

    ['Ancho', 'Alto', 'Avance'].forEach(key => {
      if (!resumen[key]) resumen[key] = { real: 0, programado: 0 };
    });

    return resumen;
  }
}
