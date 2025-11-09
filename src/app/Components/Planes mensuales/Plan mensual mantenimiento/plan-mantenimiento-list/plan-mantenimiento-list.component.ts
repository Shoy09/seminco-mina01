import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { PlanMantenimiento } from '../../../../models/plan-mantenimiento.model';
import { PlanMantenimientoService } from '../../../../services/plan-mantenimiento.service';
import { LoadingDialogComponent } from '../../../Reutilizables/loading-dialog/loading-dialog.component';
import { PlanMantenimientoDialogComponent } from '../plan-mantenimiento-dialog/plan-mantenimiento-dialog.component';
import { EditPlanMantenimientoComponent } from '../edit-plan-mantenimiento/edit-plan-mantenimiento.component';
import { CreatePlanMantenimientoComponent } from '../create-plan-mantenimiento/create-plan-mantenimiento.component';
@Component({
  selector: 'app-plan-mantenimiento-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './plan-mantenimiento-list.component.html',
  styleUrl: './plan-mantenimiento-list.component.css'
})
export class PlanMantenimientoListComponent implements OnInit {
  displayedColumns: string[] = ['zona', 'cod_equipo', 'equipo', 'acciones'];
  dataSource = new MatTableDataSource<PlanMantenimiento>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private _toastr: ToastrService,
    private planMantenimientoService: PlanMantenimientoService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.obtenerPlanes();
  }
  obtenerPlanes(): void {
    this.planMantenimientoService.getPlanesMantenimiento().subscribe({
      next: (planes) => {
        this.dataSource.data = planes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => this._toastr.error('Error al cargar los planes de mantenimiento', 'Error')
    });
  }
  aplicarFiltro(event: Event): void {
    const filtroValor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtroValor;
  }
  seleccionarArchivo(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  cargarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const hojaPlan = workbook.Sheets["PLAN"];
      const hojaSubPlan = workbook.Sheets["SUBPLAN"];
      if (!hojaPlan || !hojaSubPlan) {
        this._toastr.error('El archivo debe contener las hojas "PLAN" y "SUBPLAN".', 'Error');
        return;
      }
      const dataPlan: any[] = XLSX.utils.sheet_to_json(hojaPlan);
      const dataSubPlan: any[] = XLSX.utils.sheet_to_json(hojaSubPlan);
      const planes: PlanMantenimiento[] = dataPlan.map((fila: any) => ({
        zona: fila["ZONA"],
        cod_equipo: fila["COD_EQUIPO"],
        equipo: fila["EQUIPO"],
        subplanes: []
      }));
      dataSubPlan.forEach((fila: any) => {
        const idPlan = fila["IDPLAN"];
        const plan = planes[idPlan - 1];
        if (plan) {
          const subPlan = {
            sistema: fila["SISTEMA"],
            frecuencia: fila["FRECUENCIA"],
            h_parada: fila["H_PARADA"],
            lunes: this.booleano(fila["LUNES"]),
            martes: this.booleano(fila["MARTES"]),
            miercoles: this.booleano(fila["MIERCOLES"]),
            jueves: this.booleano(fila["JUEVES"]),
            viernes: this.booleano(fila["VIERNES"]),
            sabado: this.booleano(fila["SABADO"]),
            domingo: this.booleano(fila["DOMINGO"]),
            actividades: fila["ACTIVIDADES"],
            cumplimiento: fila["CUMPLIMIENTO"]
          };
          plan.subplanes?.push(subPlan);
        }
      });
      if (planes.length === 0) {
        this._toastr.error('No hay datos válidos para enviar.', 'Error');
        return;
      }
      this.enviarDatosAlServidor(planes);
    };
    reader.readAsArrayBuffer(archivo);
  }
  booleano(valor: any): boolean {
    if (typeof valor === 'boolean') return valor;
    if (typeof valor === 'string')
      return ['SI', 'SÍ', 'TRUE', '1', 'X'].includes(valor.trim().toUpperCase());
    if (typeof valor === 'number') return valor === 1;
    return false;
  }
  async enviarDatosAlServidor(planes: PlanMantenimiento[]): Promise<void> {
    this.mostrarPantallaCarga();
    let enviados = 0;
    let errores = 0;
    for (const [index, plan] of planes.entries()) {
      try {
        await this.planMantenimientoService.createPlanMantenimiento(plan).toPromise();
        enviados++;
      } catch (error) {
        console.error(`Error al enviar plan ${index + 1}:`, error);
        errores++;
      }
    }
    this.dialog.closeAll();
    this.obtenerPlanes();
    if (errores === 0) {
      this._toastr.success('Todos los planes se cargaron correctamente', 'Éxito');
    } else {
      this._toastr.warning(`${errores} planes tuvieron errores al cargarse`, 'Advertencia');
    }
  }
  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

editarPlan(plan: PlanMantenimiento): void {
  const dialogRef = this.dialog.open(EditPlanMantenimientoComponent, {
    width: '80vw',
    maxWidth: '1000px',
    data: plan,
    disableClose: false, // Permite cerrar al hacer clic fuera
  });

  dialogRef.afterClosed().subscribe((resultado) => {
    if (resultado) {
      this.obtenerPlanes(); 
    }
  });
}


  eliminarPlan(plan: PlanMantenimiento): void {
    if (confirm(`¿Desea eliminar el plan del equipo ${plan.equipo}?`)) {
      this.planMantenimientoService.deletePlanMantenimiento(plan.id!).subscribe({
        next: () => {
          this._toastr.success('Plan eliminado correctamente', 'Eliminado');
          this.obtenerPlanes();
        },
        error: () => this._toastr.error('Error al eliminar el plan', 'Error')
      });
    }
  }
  verPlan(plan: PlanMantenimiento): void {
  this.dialog.open(PlanMantenimientoDialogComponent, {
    width: '800px',
    data: plan,
    panelClass: 'custom-dialog-container'
  });
}


  abrirDialogoCrear(): void {
  const dialogRef = this.dialog.open(CreatePlanMantenimientoComponent, {
    width: '80vw',
    maxWidth: '1000px',
    disableClose: false
  });

  dialogRef.afterClosed().subscribe((nuevoPlan) => {
    if (nuevoPlan) {
      console.log('Nuevo plan creado:', nuevoPlan);
      this.obtenerPlanes(); // refresca la lista
    }
  });
}

}
