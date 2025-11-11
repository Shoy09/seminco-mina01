import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { MedicionesHorizontal } from '../../../../models/MedicionesHorizontal';
import { MedicionesHorizontalProgramadoService } from '../../../../services/mediciones-horizontal-programado.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions, MatProgressBarModule, MatButtonModule, CommonModule],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  labor: string = '';
  mediciones: MedicionesHorizontal[] = [];
  sumaAvanceProgramado: number = 0;
  faltanteAvance: number = 0;
  mes: string = '';
  anio: number | undefined;

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanMensual & { mes: string; anio: number },
    private medicionesService: MedicionesHorizontalProgramadoService
  ) {
    const tipo = data.tipo_labor || '';
    const labor = data.labor || '';
    const ala = data.ala || '';
    this.labor = [tipo, labor, ala].filter(v => v && v.trim() !== '').join(' ');
    this.mes = data.mes || '';
    this.anio = data.anio;
  }

  ngOnInit(): void {
    this.obtenerMedicionesPorLabor();
  }

  obtenerMedicionesPorLabor(): void {
    if (!this.labor) {
      console.warn('⚠️ No se encontró labor para consultar mediciones');
      return;
    }

    console.log(`🔍 Consultando mediciones para labor: ${this.labor}, mes: ${this.mes}, año: ${this.anio}`);

    // ✅ Aquí pasamos mes y año al servicio
    this.medicionesService.getMedicionesPorLabor(this.labor, this.mes, this.anio).subscribe({
      next: (data) => {
        this.mediciones = data;
        console.log('✅ Mediciones obtenidas:', this.mediciones);

        // 👉 Calculamos la suma del avance programado
        this.sumaAvanceProgramado = this.mediciones.reduce((total, m) => total + (m.avance_programado || 0), 0);

        // 👉 Calculamos cuánto falta por avanzar
        const avancePlan = Number(this.data.avance_m) || 0;
        this.faltanteAvance = avancePlan - this.sumaAvanceProgramado;

        console.log(`📊 Avance planificado: ${avancePlan}`);
        console.log(`📈 Suma de avance programado: ${this.sumaAvanceProgramado}`);
        console.log(`⏳ Faltante por avanzar: ${this.faltanteAvance}`);
      },
      error: (err) => console.error('❌ Error al obtener mediciones:', err)
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
