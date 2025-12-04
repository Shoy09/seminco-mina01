import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { NubeDatosTrabajoExploracionesService } from '../../../../services/nube-datos-trabajo-exploraciones.service';
import { Explosivo } from '../../../../models/Explosivo';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { NubeDatosTrabajoExploraciones } from '../../../../models/nube-datos-trabajo-exploraciones';
import { Tonelada } from '../../../../models/tonelada';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { MatProgressBar } from "@angular/material/progress-bar";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions, MatButtonModule, MatProgressBar, CommonModule],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  tipoLabor: string = '';
  labor: string = '';
  ala: string = '';
  toneladas_plan: number = 0;
  exploraciones: NubeDatosTrabajoExploraciones[] = [];
  medicionesProceso: MedicionesHorizontal[] = [];
  sumaToneladas: number = 0;
  faltanteToneladas: number = 0;
  mes: string = '';
  anio: number | undefined;

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanProduccion & { explosivos: Explosivo[], toneladas: Tonelada[],  mes: string; anio: number  },
    private exploracionesService: NubeDatosTrabajoExploracionesService
  ) {
    this.tipoLabor = data.tipo_labor || '';
    this.labor = data.labor || '';
    this.ala = data.ala || '';
    this.toneladas_plan = data.cut_off_2 || 0;
    this.mes = data.mes || '';
    this.anio = data.anio;
  }

  ngOnInit(): void {
    this.obtenerExploraciones();
  }

  obtenerExploraciones(): void {
  if (!this.tipoLabor || !this.labor) {
    console.warn('⚠️ No se encontraron datos suficientes para consultar exploraciones');
    return;
  }

  console.log(`🔍 Consultando exploraciones: tipo=${this.tipoLabor}, labor=${this.labor}, ala=${this.ala}, mes=${this.mes}, año=${this.anio}`);

  this.exploracionesService
    .getExploracionesPorLabor(this.tipoLabor, this.labor, this.ala, this.mes, this.anio)
    .subscribe({
      next: (data) => {
        this.exploraciones = data;
        console.log('✅ Exploraciones obtenidas:', this.exploraciones);
        this.procesarExploraciones();
        this.calcularToneladasRestantes();
      },
      error: (err) => {
        console.error('❌ Error al obtener exploraciones:', err);
      }
    });
}

get laborCompleta(): string {
  return [this.tipoLabor, this.labor, this.ala].filter(val => val).join(' ') || '-';
}


  procesarExploraciones(): void {
    const datosFormateados: MedicionesHorizontal[] = [];

    this.exploraciones.forEach((registro) => {
      let totalKg = 0;

      // --- Calcular totales de despachos y devoluciones ---
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

      // --- Calcular diferencia y peso total ---
      Object.entries(despachosTotales).forEach(([nombre, cantidadDespacho]) => {
        const cantidadDevolucion = devolucionesTotales[nombre] || 0;
        const diferencia = cantidadDespacho - cantidadDevolucion;
        const explosivo = this.data.explosivos.find(e => e.tipo_explosivo === nombre);
        if (explosivo) totalKg += diferencia * explosivo.peso_unitario;
      });

      // --- Buscar toneladas de la labor ---
      // --- Buscar toneladas de la labor y fecha ---
const laborRegistro = `${registro.tipo_labor ?? ''} ${registro.labor ?? ''} ${registro.ala ?? ''}`.trim().toLowerCase();

const toneladaEncontrada = this.data.toneladas.find(t => 
  t.labor?.trim().toLowerCase() === laborRegistro &&
  t.fecha === registro.fecha
);

const toneladasValor = toneladaEncontrada ? toneladaEncontrada.toneladas : 0;



      // --- Ajuste de fecha ---
      const nuevaFecha = new Date(registro.fecha);
      if (registro.turno?.toLowerCase() === 'noche') nuevaFecha.setDate(nuevaFecha.getDate() + 1);

      const semanaLimpia = registro.semanaSelect?.toString().replace(/semana\s*/i, '').trim() || '';

      const medicion: MedicionesHorizontal = {
        fecha: registro.fecha,
        turno: registro.turno,
        empresa: registro.empresa,
        zona: registro.zona,
        labor: laborRegistro,
        veta: registro.veta,
        tipo_perforacion: registro.tipo_perforacion,
        kg_explosivos: Number(totalKg.toFixed(2)),
        toneladas: toneladasValor,
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
    console.log("✅ Mediciones formateadas con toneladas:", this.medicionesProceso);
  }

  calcularToneladasRestantes(): void {
    this.sumaToneladas = this.medicionesProceso.reduce((total, m) => total + (m.toneladas || 0), 0);
    this.faltanteToneladas = this.toneladas_plan - this.sumaToneladas;

    console.log(`📦 Toneladas planificadas: ${this.toneladas_plan}`);
    console.log(`📦 Toneladas registradas: ${this.sumaToneladas}`);
    console.log(`⏳ Toneladas restantes: ${this.faltanteToneladas}`);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}