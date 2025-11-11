import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { EditPlanAvanceComponent } from '../edit-plan-avance/edit-plan-avance.component';
import { PlanDetallesDialogComponent } from '../plan-detalles-dialog/plan-detalles-dialog.component';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { FechasPlanMensualService } from '../../../../services/fechas-plan-mensual.service';
import { PlanMensualService } from '../../../../services/plan-mensual.service';
import { LoadingDialogComponent } from '../../../Reutilizables/loading-dialog/loading-dialog.component';
import { CreatePlanAvanceComponent } from '../create-plan-avance/create-plan-avance.component';
import { DialogDiferenciaPlanRealidadComponent } from '../dialog-diferencia-plan-realidad/dialog-diferencia-plan-realidad.component';

@Component({
  selector: 'app-plan-mensual-list',
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
  templateUrl: './plan-mensual-list.component.html',
  styleUrl: './plan-mensual-list.component.css'
})
export class PlanMensualListComponent implements OnInit {
  displayedColumns: string[] = [
    'anio', 'mes', 'minado_tipo', 'zona', 
    'tipo_mineral', 'fase', 'tipo_labor', 'labor', 'acciones'
  ];
  dataSource = new MatTableDataSource<PlanMensual>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _toastr: ToastrService, private planMensualService: PlanMensualService, public dialog: MatDialog, private fechasPlanMensualService: FechasPlanMensualService) {}
  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;
  ngOnInit(): void {
    this.obtenerUltimaFecha();
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        //console.log('Fecha recibida:', ultimaFecha);
        //console.log('Tipo de año:', typeof ultimaFecha.fecha_ingreso);
        //console.log('Tipo de mes:', typeof ultimaFecha.mes);
        //console.log('Valor de mes:', ultimaFecha.mes);
        
        // Asignar los valores de anio y mes
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;
  
        // Verificar que 'anio' no sea undefined antes de llamar a la función
        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase(); // Asegurar formato consistente
          this.obtenerPlanesMensuales(anio, this.mes);
        } else {
          //console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        //console.error('Error al obtener la última fecha:', error);
      }
    );
  }
  
  
  obtenerPlanesMensuales(anio: number, mes: string): void {
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
      (planes) => {
        this.dataSource.data = planes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        //console.error('Error al obtener los planes mensuales:', error);
      }
    );
  }
  
  

  aplicarFiltro(event: Event) {
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
      const sheetName = "PLAN METRAJE AVANCES";
      const sheet = workbook.Sheets[sheetName];
  
      if (!sheet) {
        this._toastr.error(`La hoja "${sheetName}" no existe en el archivo.`, 'Error');
        return;
      }
  
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
      const errores: string[] = [];
  
      // 1. Filtrar filas válidas (año/mes correctos) y mapear
      const planesValidos: PlanMensual[] = jsonData
        .filter((fila: any, index: number) => {
          const anioFila = Number(fila["AÑO"]);
          const mesFila = String(fila["MES"]).trim().toUpperCase();
  
          if (anioFila !== this.anio || mesFila !== this.mes) {
            errores.push(`Fila ${index + 1} ignorada: Año/Mes no coinciden (Año: ${anioFila}, Mes: ${mesFila})`);
            return false; // Excluir esta fila
          }
          return true; // Incluir esta fila
        })
        .map((fila: any) => this.mapearFilaAPlanMensual(fila));
  
      // 2. Si NO hay filas válidas, mostrar error y salir
      if (planesValidos.length === 0) {
        this._toastr.error('No hay filas válidas para enviar. Verifica el año y mes.', 'Error');
        return;
      }
  
      // 3. Si hay filas válidas, enviarlas al servidor
      this.enviarDatosAlServidor(planesValidos);
  
      // 4. Mostrar advertencia si hubo filas ignoradas
      if (errores.length > 0) {
        this._toastr.warning(
          `Se ignoraron ${errores.length} filas por año/mes incorrecto. Verifica la consola para detalles.`,
          'Advertencia',
          { closeButton: true, timeOut: 7000 }
        );
        //console.warn('Filas ignoradas:', errores);
      }
    };
  
    reader.readAsArrayBuffer(archivo);
  }
  
  

  mapearFilaAPlanMensual(fila: any): PlanMensual {
    return {
      anio: fila["AÑO"],
      mes: fila["MES"],
      minado_tipo: fila["MINADO/TIPO"],
      empresa: fila["EMPRESA"],
      zona: fila["ZONA"],
      area: fila["AREA"],
      tipo_mineral: fila["TIPO DE MINERAL"],
      fase: fila["FASE"],
      estructura_veta: fila["ESTRUCTURA/VETA"],
      nivel: fila["NIVEL"],
      tipo_labor: fila["TIPO LABOR"],
      labor: fila["LABOR"],
      ala: fila["ALA"],
      avance_m: fila["AVANCE (m)"],
      ancho_m: fila["ANCHO (m)"],
      alto_m: fila["ALTO (m)"],
      tms: fila["TMS "],
      // Mapeo dinámico de columnas 1A - 28B
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}A`, fila[`${i + 1}A`] !== undefined ? fila[`${i + 1}A`].toString().trim() : null
        ])
      ),
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}B`, fila[`${i + 1}B`] !== undefined ? fila[`${i + 1}B`].toString().trim() : null
        ])
      )
    };
  }
  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(CreatePlanAvanceComponent, {
      width: '500px',
      data: { 
        anio: this.anio, 
        mes: this.mes 
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Si el resultado es `true`, significa que se creó un nuevo plan
        this.obtenerUltimaFecha(); // Llamamos a la función para actualizar la lista
      }
    });
  }
  
  

async enviarDatosAlServidor(planes: PlanMensual[]): Promise<void> {
    //console.log('Iniciando envío de datos al servidor. Total planes:', planes.length);
    this.mostrarPantallaCarga();

    let enviados = 0;
    let errores = 0;

    // Enviar registros uno por uno
    for (const [index, plan] of planes.entries()) {
        try {
            //console.log(`Enviando plan mensual ${index + 1}/${planes.length}`, plan);
            const response = await this.planMensualService.createPlanMensual(plan).toPromise();
            //console.log(`Plan mensual ${index + 1} enviado con éxito`, response);
            enviados++;
        } catch (error) {
            //console.error(`Error al enviar plan mensual ${index + 1}:`, error);
            errores++;
            // Opcional: puedes agregar un reintento aquí si es necesario
        }
    }

    this.verificarCargaCompleta(planes.length, enviados, errores);
}
  
  verificarCargaCompleta(total: number, enviados: number, errores: number): void {
    if (enviados + errores === total) {
      this.dialog.closeAll(); // Cerrar la pantalla de carga
      this.obtenerUltimaFecha(); // Recargar la tabla con los nuevos datos
  
      // Mostrar una notificación de éxito si todo salió correctamente
      if (errores === 0) {
        this._toastr.success('Los datos se cargaron correctamente', 'Carga exitosa', {
          closeButton: true,
          progressBar: true,
          timeOut: 5000
        });
      } else {
        this._toastr.error(`Hubo ${errores} errores durante la carga`, 'Error en la carga', {
          closeButton: true,
          progressBar: true,
          timeOut: 5000
        });
      }
    }
  }
  
mostrarPantallaCarga() {
  this.dialog.open(LoadingDialogComponent, {
    disableClose: true
  });
}
 
editarPlan(plan: PlanMensual): void {

  const dialogRef = this.dialog.open(EditPlanAvanceComponent, {
    width: '450px',
    data: { ...plan } // Clonamos el objeto para evitar modificaciones antes de confirmar la API
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) { // Solo actualizamos si la API confirmó los cambios
      // Aquí puedes actualizar la lista localmente si es necesario
      this.obtenerUltimaFecha(); // Ejemplo: Recargar la lista de planes desde la API
    }
  });
}


eliminarPlan(plan: any): void {
  if (confirm(`¿Está seguro de eliminar el plan del año ${plan.anio}?`)) {
    
    // Llamar al servicio para eliminar el plan
  }
}

verPlan(plan: any): void {
  this.dialog.open(PlanDetallesDialogComponent, {
    width: '400px', // Ajusta el tamaño según necesites
    data: plan
  });
}

verDiferencias(plan: PlanMensual): void {
  this.dialog.open(DialogDiferenciaPlanRealidadComponent, {
    width: '600px',
    data: {
      tipo_labor: plan.tipo_labor,
      labor: plan.labor,
      ala: plan.ala,
      avance_m: plan.avance_m,
      mes: this.mes,      
      anio: this.anio      
    }
  });
}

   
}