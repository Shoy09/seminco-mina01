import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { NubeOperacion } from '../../../../models/operaciones.models';
import { TooltipLaborComponent } from '../../Dialog/Produccion/tooltip-labor/tooltip-labor.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProduccionDetalleDialogComponent } from '../produccion-detalle-dialog/produccion-detalle-dialog.component';

type EventoTipo = 'PERFORADO' | 'DISPARADA' | 'LIMPIEZA' | 'ACARREO' | 'SOSTENIMIENTO';

interface LaborFila {
  proceso: string;
  zona: string;
  labor: string;
  programado: number;
  real: number;
  ancho: number;
  alto: number;
  anchoReal?: number;
  altoReal?: number;
  fechaUltima?: string | null;
  turnoUltimo?: string | null;
  color?: string;
  etapaFinal?: EventoTipo | null;
}

interface ZonaAgrupada {
  nombre: string;
  labores: LaborFila[];
}

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, TooltipLaborComponent, MatDialogModule],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css']
})
export class ProduccionComponent implements OnChanges {
  @Input() Produccion: PlanProduccion[] = [];
  @Input() mediciones: MedicionesHorizontal[] = [];
  @Input() operacionesLargo: NubeOperacion[] = [];
  @Input() operacionesSostenimiento: NubeOperacion[] = [];

  estadoColorMap: Record<EventoTipo, string> = {
    PERFORADO: '#4caf50',
    DISPARADA: '#f44336',
    LIMPIEZA: '#ff9800',
    ACARREO: '#2196f3',
    SOSTENIMIENTO: '#9c27b0'
  };

  etapasOrden: EventoTipo[] = ['PERFORADO', 'DISPARADA', 'LIMPIEZA', 'ACARREO', 'SOSTENIMIENTO'];

  zonasAgrupadas: ZonaAgrupada[] = [];
  expandido: { [clave: string]: boolean } = {};

  // tooltip
  tooltipVisible = false;
  tooltipLabor: any = null;
  tooltipX = 0;
  tooltipY = 0;

  // resumen por etapa (toneladas)
  resumenPorEtapa: Record<EventoTipo, { count: number; labores: LaborFila[] }> = {
    PERFORADO: { count: 0, labores: [] },
    DISPARADA: { count: 0, labores: [] },
    LIMPIEZA: { count: 0, labores: [] },
    ACARREO: { count: 0, labores: [] },
    SOSTENIMIENTO: { count: 0, labores: [] }
  };

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['Produccion'] ||
      changes['mediciones'] ||
      changes['operacionesLargo'] ||
      changes['operacionesSostenimiento']
    ) {
      this.construirEstructura();
    }
  }

  // ------------------ tooltip ------------------
  mostrarTooltip(event: MouseEvent, labor: any) {
    this.tooltipVisible = true;
    this.tooltipLabor = labor;
    this.tooltipX = event.clientX + 12;
    this.tooltipY = event.clientY + 12;
  }
  ocultarTooltip() {
    this.tooltipVisible = false;
  }

  // ------------------ normalización ------------------
  private normalizarLabor(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  private normalizeDateToYMD(dateStr: string | undefined | null): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }

  // ------------------ eventos por labor ------------------
  private getEventosParaLabor(laborKey: string): { tipo: EventoTipo; fecha: string }[] {
    const eventos: { tipo: EventoTipo; fecha: string }[] = [];

    // Mediciones -> DISPARADA
    for (const med of this.mediciones) {
      const laborMed = (med.labor ?? '').toString().trim();
      if (!laborMed || laborMed !== laborKey) continue;
      const f = this.normalizeDateToYMD(med.fecha ?? '');
      if (!f) continue;
      eventos.push({ tipo: 'DISPARADA', fecha: f });
    }

    // Operaciones Largo -> PERFORADO + LIMPIEZA + ACARREO
    for (const op of this.operacionesLargo ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      for (const pl of op.perforaciones ?? []) {
        const laborOp = [pl.tipo_labor, pl.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
        if (laborOp === laborKey) eventos.push({ tipo: 'PERFORADO', fecha: fechaOp });
      }

      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const pl of op.perforaciones ?? []) {
            const laborOp = [pl.tipo_labor, pl.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) eventos.push({ tipo: 'LIMPIEZA', fecha: fechaSt });
          }
        }

        if (estadoTxt.includes('acarreo') || estadoTxt.includes('cargu')) {
          for (const pl of op.perforaciones ?? []) {
            const laborOp = [pl.tipo_labor, pl.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
          }
        }
      }
    }

    // Operaciones sostenimiento -> SOSTENIMIENTO + LIMPIEZA + ACARREO
    for (const op of this.operacionesSostenimiento ?? []) {
      const fechaOp = this.normalizeDateToYMD(op.fecha ?? '');
      if (!fechaOp) continue;

      for (const s of op.sostenimientos ?? []) {
        const laborOp = [s.tipo_labor, s.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
        if (laborOp === laborKey) eventos.push({ tipo: 'SOSTENIMIENTO', fecha: fechaOp });
      }

      for (const st of op.estados ?? []) {
        const estadoTxt = (st.estado ?? '').toString().toLowerCase();
        const fechaSt = this.normalizeDateToYMD(op.fecha ?? '') ?? null;
        if (!fechaSt) continue;

        if (estadoTxt.includes('limpie') || estadoTxt.includes('limpieza')) {
          for (const s of op.sostenimientos ?? []) {
            const laborOp = [s.tipo_labor, s.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) eventos.push({ tipo: 'LIMPIEZA', fecha: fechaSt });
          }
        }

        if (estadoTxt.includes('acarreo') || estadoTxt.includes('cargu')) {
          for (const s of op.sostenimientos ?? []) {
            const laborOp = [s.tipo_labor, s.labor].filter(v => v && v.toString().trim() !== '').join(' ').trim();
            if (laborOp === laborKey) eventos.push({ tipo: 'ACARREO', fecha: fechaSt });
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

  private decidirEtapaSegunLineaTrabajo(eventos: { tipo: EventoTipo; fecha: string }[]): EventoTipo | null {
    if (!eventos.length) return null;

    const perforados = eventos.filter(e => e.tipo === 'PERFORADO');
    if (!perforados.length) return null;

    const ultimoPerforado = perforados.reduce((prev, curr) => (curr.fecha > prev.fecha ? curr : prev), perforados[0]);
    const desdePerforado = eventos.filter(e => e.fecha >= ultimoPerforado.fecha);
    if (!desdePerforado.length) return 'PERFORADO';

    let mejor: EventoTipo = 'PERFORADO';
    for (const e of desdePerforado) {
      if (this.etapasOrden.indexOf(e.tipo) > this.etapasOrden.indexOf(mejor)) mejor = e.tipo;
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

  // ------------------ construir estructura ------------------
  private construirEstructura(): void {
    // reset
    Object.keys(this.resumenPorEtapa).forEach(k => {
      const key = k as EventoTipo;
      this.resumenPorEtapa[key].count = 0;
      this.resumenPorEtapa[key].labores = [];
    });

    this.expandido = {};

    // 0. mapa de toneladas por labor normalizada (mediciones)
    const realPorLabor: Record<string, number> = {};
    const ultimaMedicionPorLabor: Record<string, MedicionesHorizontal> = {};

    for (const med of this.mediciones ?? []) {
      if (!med.labor) continue;
      const laborNorm = this.normalizarLabor(med.labor);
      const toneladas = med.toneladas ?? 0;
      realPorLabor[laborNorm] = (realPorLabor[laborNorm] ?? 0) + toneladas;

      const laborVisible = med.labor.toString().trim();
      if (!laborVisible) continue;

      const actual = ultimaMedicionPorLabor[laborVisible];
      const fechaNueva = med.fecha ?? '';
      const idNuevo = med.id ?? 0;
      if (!actual) ultimaMedicionPorLabor[laborVisible] = med;
      else {
        const fechaActual = actual.fecha ?? '';
        const idActual = actual.id ?? 0;
        if (fechaNueva > fechaActual) ultimaMedicionPorLabor[laborVisible] = med;
        else if (fechaNueva === fechaActual && idNuevo > idActual) ultimaMedicionPorLabor[laborVisible] = med;
      }
    }

    // 1. filas desde Produccion
    const filas: LaborFila[] = (this.Produccion ?? []).map(item => {
      const proceso = 'Largo';
      const laborNombreVisible = [item.tipo_labor, item.labor, item.ala].filter(v => v && v.toString().trim() !== '').join(' ').trim();
      const laborKeyNorm = this.normalizarLabor(laborNombreVisible || '');
      const real = (laborKeyNorm && realPorLabor[laborKeyNorm]) ? realPorLabor[laborKeyNorm] : 0;

      const ultima = laborNombreVisible ? ultimaMedicionPorLabor[laborNombreVisible] : undefined;

      const fila: LaborFila = {
        proceso,
        zona: item.zona || 'SIN ZONA',
        labor: laborNombreVisible || 'SIN LABOR',
        programado: (item.cut_off_2 as number) ?? 0,
        real,
        ancho: 0,
        alto: 0,
        anchoReal: ultima?.ancho ?? 0,
        altoReal: ultima?.alto ?? 0,
        fechaUltima: ultima?.fecha ?? null,
        turnoUltimo: ultima?.turno ?? null,
        color: laborNombreVisible ? this.getColorParaLabor(laborNombreVisible) : '#bdbdbd',
        etapaFinal: null
      };

      // determinar etapa final y actualizar resumenPorEtapa
      const eventos = this.getEventosParaLabor(laborNombreVisible);
      const etapa = this.decidirEtapaSegunLineaTrabajo(eventos);
      if (etapa) {
        fila.etapaFinal = etapa;
        this.resumenPorEtapa[etapa].count += 1;
        this.resumenPorEtapa[etapa].labores.push(fila);
      }

      return fila;
    });

    // 2. agrupar por zona y ordenar
    const agrupadoPorZona: Record<string, LaborFila[]> = {};
    filas.forEach(f => {
      agrupadoPorZona[f.zona] = agrupadoPorZona[f.zona] ?? [];
      agrupadoPorZona[f.zona].push(f);
    });

    Object.keys(agrupadoPorZona).forEach(z => {
      agrupadoPorZona[z].sort((a, b) => {
        const aTieneColor = a.color !== '#bdbdbd';
        const bTieneColor = b.color !== '#bdbdbd';
        if (aTieneColor && !bTieneColor) return -1;
        if (!aTieneColor && bTieneColor) return 1;
        return 0;
      });
    });

    this.zonasAgrupadas = Object.keys(agrupadoPorZona).map(z => ({ nombre: z, labores: agrupadoPorZona[z] }));
    this.zonasAgrupadas.forEach(z => (this.expandido[z.nombre] = true));
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
      resumen[l.labor] = resumen[l.labor] ?? { real: 0, programado: 0 };
      resumen[l.labor].real += l.real;
      resumen[l.labor].programado += l.programado;
    });
    ['Ancho', 'Alto', 'Avance'].forEach(k => (resumen[k] = resumen[k] ?? { real: 0, programado: 0 }));
    return resumen;
  }

  // ------------------ interacciones UI ------------------
  onMouseEnterEtapa(event: MouseEvent, etapa: EventoTipo) {
    const info = { etapa, count: this.resumenPorEtapa[etapa].count };
    this.mostrarTooltip(event, info);
  }

  onMouseLeaveEtapa() {
    this.ocultarTooltip();
  }

  abrirModalEtapa(etapa: EventoTipo) {
    // abre diálogo y pasa sólo las zonas (o filtrar sólo las labores de esa etapa si prefieres)
    const zonasFiltradas = this.zonasAgrupadas.map(z => ({
      nombre: z.nombre,
      labores: z.labores.filter(l => l.etapaFinal === etapa)
    })).filter(z => z.labores.length > 0);

    this.dialog.open(ProduccionDetalleDialogComponent, {
      width: '900px',
      data: {
        etapa,
        zonas: zonasFiltradas
      }
    });
  }
}
