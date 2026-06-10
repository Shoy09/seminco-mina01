import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { NubeOperacion } from '../../../../models/operaciones.models';
import { TooltipLaborComponent } from '../../Dialog/tooltip-labor/tooltip-labor.component';
import { MatDialog } from '@angular/material/dialog';
import { ZonaDetalleDialogComponent } from '../zona-detalle-dialog/zona-detalle-dialog.component';

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
  etapaFinal?: EventoTipo | null;
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

  constructor(private dialog: MatDialog) {}
  
  @Input() avance: PlanMensual[] = [];
  @Input() mediciones: MedicionesHorizontal[] = [];

  @Input() operacionesHorizontal: NubeOperacion[] = [];
  @Input() operacionesSostenimiento: NubeOperacion[] = [];

  // Mapa de colores por estado
  estadoColorMap: Record<string, string> = {
    'PERFORADO': '#4caf50',
    'DISPARADA': '#f44336',
    'LIMPIEZA': '#ff9800',
    'ACARREO': '#2196f3',
    'SOSTENIMIENTO': '#9c27b0'
  };

  etapasOrden: EventoTipo[] = ['PERFORADO', 'DISPARADA', 'LIMPIEZA', 'ACARREO', 'SOSTENIMIENTO'];

  zonasAgrupadas: ZonaAgrupada[] = [];
  expandido: { [clave: string]: boolean } = {};

  // tooltip para cuadros y botones
  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  // Nuevo: resumen por etapa y modal
  resumenPorEtapa: Record<EventoTipo, { count: number; labores: LaborFila[] }> = {
    PERFORADO: { count: 0, labores: [] },
    DISPARADA: { count: 0, labores: [] },
    LIMPIEZA: { count: 0, labores: [] },
    ACARREO: { count: 0, labores: [] },
    SOSTENIMIENTO: { count: 0, labores: [] }
  };

  // Modal state
  modalOpen = false;
  modalEtapaSeleccionada: EventoTipo | null = null;
  modalLabores: LaborFila[] = [];

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

  // ---------- Eventos por labor (mismo código que antes) ----------

  private getEventosParaLabor(laborKey: string): { tipo: EventoTipo; fecha: string }[] {
    const eventos: { tipo: EventoTipo; fecha: string }[] = [];

    for (const med of this.mediciones) {
      const laborMed = (med.labor ?? '').toString().trim();
      if (!laborMed || laborMed !== laborKey) continue;
      const f = this.normalizeDateToYMD(med.fecha ?? '');
      if (!f) continue;
      eventos.push({ tipo: 'DISPARADA', fecha: f });
    }

    for (const op of this.operacionesHorizontal ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      for (const ph of op.perforaciones_horizontal ?? []) {
        const laborOp = [
          ph.tipo_labor,
          ph.labor
        ].filter(v => v && v.toString().trim() !== '').join(' ').trim();

        if (laborOp === laborKey) {
          eventos.push({ tipo: 'PERFORADO', fecha: fechaOp });
        }
      }

      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const ph of op.perforaciones_horizontal ?? []) {
            const laborOp = [
              ph.tipo_labor,
              ph.labor
            ].filter(v => v && v.toString().trim() !== '').join(' ').trim();
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
            ].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
            }
          }
        }
      }
    }

    for (const op of this.operacionesSostenimiento ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      for (const s of op.sostenimientos ?? []) {
        const laborOp = [
          s.tipo_labor,
          s.labor
        ].filter(v => v && v.toString().trim() !== '').join(' ').trim();

        if (laborOp === laborKey) {
          eventos.push({ tipo: 'SOSTENIMIENTO', fecha: fechaOp });
        }
      }

      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const s of op.sostenimientos ?? []) {
            const laborOp = [
              s.tipo_labor,
              s.labor
            ].filter(v => v && v.toString().trim() !== '').join(' ').trim();
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
            ].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) {
              eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
            }
          }
        }
      }
    }

    eventos.sort((a, b) => {
      if (a.fecha < b.fecha) return -1;
      if (a.fecha > b.fecha) return 1;
      return this.etapasOrden.indexOf(a.tipo) - this.etapasOrden.indexOf(b.tipo);
    });

    return eventos;
  }

  private decidirEtapaSegunLineaTrabajo(
    eventos: { tipo: EventoTipo; fecha: string }[]
  ): EventoTipo | null {
    if (!eventos.length) return null;

    const perforados = eventos.filter(e => e.tipo === 'PERFORADO');
    if (!perforados.length) {
      return null;
    }

    const ultimoPerforado = perforados.reduce((prev, curr) => (curr.fecha > prev.fecha ? curr : prev), perforados[0]);

    const desdePerforado = eventos.filter(e => e.fecha >= ultimoPerforado.fecha);
    if (!desdePerforado.length) return 'PERFORADO';

    let mejor: EventoTipo = 'PERFORADO';
    for (const e of desdePerforado) {
      if (this.etapasOrden.indexOf(e.tipo) > this.etapasOrden.indexOf(mejor)) {
        mejor = e.tipo;
      }
    }
    return mejor;
  }

  private getColorParaLabor(laborKey: string): string {
    const eventos = this.getEventosParaLabor(laborKey);
    if (!eventos.length) return '#bdbdbd';
    const etapaFinal = this.decidirEtapaSegunLineaTrabajo(eventos);
    if (!etapaFinal) return '#bdbdbd';
    return this.estadoColorMap[etapaFinal] ?? '#bdbdbd';
  }

  // ---------- Construcción de estructura principal ----------
  private construirEstructura(): void {
    this.expandido = {};
    console.log('🔧 [construirEstructura] Inicio');

    // reset resumen por etapa
    Object.keys(this.resumenPorEtapa).forEach(k => {
      const key = k as EventoTipo;
      this.resumenPorEtapa[key].count = 0;
      this.resumenPorEtapa[key].labores = [];
    });

    const realPorLabor: Record<string, number> = {};
    const ultimaMedicionPorLabor: Record<string, MedicionesHorizontal> = {};

    // Agrupar mediciones
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

    const filas: LaborFila[] = this.avance.map(item => {
      const laborNombre = [
        item.tipo_labor,
        item.labor,
        item.ala
      ].filter(v => v && v.toString().trim() !== '').join(' ').trim();

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

      // Determinar etapa final (se usa la lógica completa de eventos)
      const eventos = laborKey ? this.getEventosParaLabor(laborKey) : [];
      const etapaFinal = this.decidirEtapaSegunLineaTrabajo(eventos);
      const color = etapaFinal ? (this.estadoColorMap[etapaFinal] ?? '#bdbdbd') : '#bdbdbd';

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
        color,
        etapaFinal: etapaFinal ?? null
      };

      // actualizar resumen por etapa
      if (fila.etapaFinal) {
        const rec = this.resumenPorEtapa[fila.etapaFinal];
        if (rec) {
          rec.count += 1;
          rec.labores.push(fila);
        }
      }

      return fila;
    });

    // Agrupar por zona (sigue estando disponible por compatibilidad)
    const agrupadoPorZona: Record<string, LaborFila[]> = {};
    filas.forEach(fila => {
      if (!agrupadoPorZona[fila.zona]) agrupadoPorZona[fila.zona] = [];
      agrupadoPorZona[fila.zona].push(fila);
    });

    // ordenar dentro de cada zona como antes
    Object.keys(agrupadoPorZona).forEach(zona => {
      agrupadoPorZona[zona].sort((a, b) => {
        const aTieneColor = a.color !== '#bdbdbd';
        const bTieneColor = b.color !== '#bdbdbd';
        if (aTieneColor && !bTieneColor) return -1;
        if (!aTieneColor && bTieneColor) return 1;
        return 0;
      });
    });

    this.zonasAgrupadas = Object.keys(agrupadoPorZona).map(z => ({
      nombre: z,
      labores: agrupadoPorZona[z]
    }));

    // expandir por defecto (opcional)
    this.zonasAgrupadas.forEach(z => {
      this.expandido[z.nombre] = true;
    });

    console.log('📦 [construirEstructura] resumenPorEtapa:', this.resumenPorEtapa);
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

  // ---------- Interacciones con botones/diálogo ----------
  onMouseEnterEtapa(event: MouseEvent, etapa: EventoTipo) {
    // mostramos tooltip pequeño con conteo
    const info = {
      etapa,
      count: this.resumenPorEtapa[etapa].count
    };
    this.mostrarTooltip(event, info);
  }

  onMouseLeaveEtapa() {
    this.ocultarTooltip();
  }


  cerrarModal() {
    this.modalOpen = false;
    this.modalEtapaSeleccionada = null;
    this.modalLabores = [];
  }

  seleccionarLaborEnModal(l: LaborFila) {
    // ejemplo: mostrar la tooltip con detalle dentro del modal
    this.tooltipLabor = l;
    this.tooltipVisible = true;
    // colocarlo en el centro del modal (simple)
    this.tooltipX = window.innerWidth / 2;
    this.tooltipY = window.innerHeight / 2;
  }

  abrirModalEtapa(etapa: EventoTipo) {
  this.modalEtapaSeleccionada = etapa;
  this.modalLabores = this.resumenPorEtapa[etapa].labores;

  this.dialog.open(ZonaDetalleDialogComponent, {
    width: '900px',
    data: {
      zonas: this.zonasAgrupadas // o filtrarlas
    }
  });
}

}
