import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { NubeDatosTrabajoExploracionesService } from '../../../../services/nube-datos-trabajo-exploraciones.service';
import { Explosivo } from '../../../../models/Explosivo';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { NubeDatosTrabajoExploraciones } from '../../../../models/nube-datos-trabajo-exploraciones';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  tipoLabor: string = '';
  labor: string = '';
  ala: string = '';
  exploraciones: NubeDatosTrabajoExploraciones[] = [];
  mediciones: MedicionesHorizontal[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanMensual & { explosivos: Explosivo[] },
    private exploracionesService: NubeDatosTrabajoExploracionesService
  ) {
    this.tipoLabor = data.tipo_labor || '';
    this.labor = data.labor || '';
    this.ala = data.ala || '';
  }

  ngOnInit(): void {
    this.obtenerExploraciones();
  }

  obtenerExploraciones(): void {
    if (!this.tipoLabor || !this.labor) {
      console.warn('⚠️ No se encontraron datos suficientes para consultar exploraciones');
      return;
    }

    console.log(`🔍 Consultando exploraciones: tipo=${this.tipoLabor}, labor=${this.labor}, ala=${this.ala}`);

    this.exploracionesService.getExploracionesPorLabor(this.tipoLabor, this.labor, this.ala).subscribe({
      next: (data) => {
        this.exploraciones = data;
        console.log('✅ Exploraciones obtenidas:', this.exploraciones);
        this.procesarExploraciones(); // 👉 formateamos a mediciones
      },
      error: (err) => {
        console.error('❌ Error al obtener exploraciones:', err);
      }
    });
  }

  procesarExploraciones(): void {
    const datosFormateados: MedicionesHorizontal[] = [];

    this.exploraciones.forEach((registro) => {
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

        const explosivo = this.data.explosivos.find((e) => e.tipo_explosivo === nombre);
        if (explosivo) {
          totalKg += diferencia * explosivo.peso_unitario;
        }
      });

      // --- Ajuste de fecha y semana ---
      const nuevaFecha = new Date(registro.fecha);
      if (registro.turno?.toLowerCase() === 'noche') {
        nuevaFecha.setDate(nuevaFecha.getDate() + 1);
      }

      const semanaLimpia = registro.semanaSelect
        ? registro.semanaSelect.toString().replace(/semana\s*/i, '').trim()
        : '';

      // --- Crear objeto tipo MedicionesHorizontal ---
      const medicion: MedicionesHorizontal = {
        fecha: registro.fecha,
        turno: registro.turno,
        empresa: registro.empresa,
        zona: registro.zona,
        labor: `${registro.tipo_labor ?? ''} ${registro.labor ?? ''} ${registro.ala ?? ''}`.trim(),
        veta: registro.veta,
        tipo_perforacion: registro.tipo_perforacion,
        kg_explosivos: Number(totalKg.toFixed(2)),
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

    this.mediciones = datosFormateados;
    console.log("✅ Mediciones formateadas:", this.mediciones);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
