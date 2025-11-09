import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { PlanProduccionDetallesDialogComponent } from '../plan-produccion-detalles-dialog/plan-produccion-detalles-dialog.component';

import { ToastrService } from 'ngx-toastr';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { FechasPlanMensualService } from '../../../../services/fechas-plan-mensual.service';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { LoadingDialogComponent } from '../../../Reutilizables/loading-dialog/loading-dialog.component';
import { EditPlanProduccionComponent } from '../edit-plan-produccion/edit-plan-produccion.component';
import { CreatePlanProduccionComponent } from '../create-plan-produccion/create-plan-produccion.component';

@Component({
  selector: 'app-plan-produccion-list',
  imports: [MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatButtonModule,
      MatIconModule,
      MatDialogModule,
      MatInputModule, 
      MatFormFieldModule],
  templateUrl: './plan-produccion-list.component.html',
  styleUrl: './plan-produccion-list.component.css'
})
export class PlanProduccionListComponent implements OnInit {
  displayedColumns: string[] = [
    'mes', 'semana', 'mina', 'zona', 
    'tipo_mineral', 'labor', 'acciones'
  ];
  dataSource = new MatTableDataSource<PlanProduccion>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _toastr: ToastrService,
    private planProduccionService: PlanProduccionService,
    public dialog: MatDialog,
    private fechasPlanMensualService: FechasPlanMensualService
  ) {}
  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;

  ngOnInit(): void {
    this.obtenerUltimaFecha();
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        
        
        // Usar el operador de encadenamiento opcional y comprobar si es undefined
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;
  
        // Verificar que 'anio' no sea undefined antes de llamar a la función
        if (anio !== undefined) {
          this.anio = anio;  // Asignamos el valor de anio a la propiedad del componente
          this.mes = mes; 
          this.obtenerPlanesMetraje(anio, mes);
        } else {
          //console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        //console.error('Error al obtener la última fecha:', error);
      }
    );
  }

  obtenerPlanesMetraje(anio: number, mes: string): void {
    this.planProduccionService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
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

  aplicarFiltro(event: Event): void {
    const filtroValor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filtroValor;
  }

    abrirDialogoCrear(): void {
      const dialogRef = this.dialog.open(CreatePlanProduccionComponent, {
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

  seleccionarArchivo(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
}

cargarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    //console.log('Archivo seleccionado:', archivo.name); // Log 1: Nombre del archivo

    const reader = new FileReader();
    reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = "PLAN PRODUCCIÓN";
        const sheet = workbook.Sheets[sheetName];
        
        //console.log('Hojas disponibles:', workbook.SheetNames); // Log 2: Hojas del Excel

        if (!sheet) {
            //console.error(`La hoja "${sheetName}" no se encontró`); // Log 3: Error de hoja
            this._toastr.error(`La hoja "${sheetName}" no existe en el archivo.`, 'Error');
            return;
        }

        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
        //console.log('Total de filas en Excel:', jsonData.length); // Log 4: Total filas leídas
        
        const errores: string[] = [];

        // 1. Filtrar filas válidas (año/mes correctos) y mapear
        const planesValidos: PlanProduccion[] = jsonData
            .filter((fila: any, index: number) => {
                //console.log(`Procesando fila ${index + 1}`, fila); // Log 5: Fila completa
                
                const anioFila = Number(fila["AÑO"]);
                const mesFila = String(fila["MES"]).trim().toUpperCase();
                
                //console.log(`Fila ${index + 1} - Año: ${anioFila}, Mes: ${mesFila}`); // Log 6: Año/Mes

                if (anioFila !== this.anio || mesFila !== this.mes) {
                    const mensaje = `Fila ${index + 1} ignorada: Año/Mes no coinciden (Año: ${anioFila}, Mes: ${mesFila})`;
                    //console.warn(mensaje); // Log 7: Fila ignorada
                    errores.push(mensaje);
                    return false;
                }
                return true;
            })
            .map((fila: any) => {
                const planMapeado = this.mapearFilaAPlanProduccion(fila);
                //console.log('Fila mapeada a PlanProduccion:', planMapeado); // Log 8: Datos mapeados
                return planMapeado;
            });

        //console.log('Total de planes válidos:', planesValidos.length); // Log 9: Planes válidos
        //console.log('Planes válidos detallados:', planesValidos); // Log 10: Detalle planes

        // 2. Si NO hay filas válidas, mostrar error y salir
        if (planesValidos.length === 0) {
            //console.error('No hay filas válidas para enviar'); // Log 11: Sin datos válidos
            this._toastr.error('No hay filas válidas para enviar. Verifica el año y mes.', 'Error');
            return;
        }

        // 3. Si hay filas válidas, enviarlas al servidor
        this.enviarDatosAlServidor(planesValidos);

        // 4. Mostrar advertencia si hubo filas ignoradas
        if (errores.length > 0) {
            //console.warn('Resumen de filas ignoradas:', errores); // Log 12: Resumen errores
            this._toastr.warning(
                `Se ignoraron ${errores.length} filas por año/mes incorrecto. Verifica la consola para detalles.`,
                'Advertencia',
                { closeButton: true, timeOut: 7000 }
            );
        }
    };

    reader.readAsArrayBuffer(archivo);
}

mapearFilaAPlanProduccion(fila: any): PlanProduccion {
    //console.log('Mapeando fila:', fila); // Log 13: Fila antes de mapear
    const plan = {
        anio: fila["AÑO"],
        mes: fila['MES'],
        semana: fila['SEMANA'],
        mina: fila['MINA'],
        zona: fila['ZONA'],
        area: fila['AREA'],
        fase: fila['FASE'],
        minado_tipo: fila['MINADO/TIPO'],
        tipo_labor: fila['TIPO LABOR'],
        tipo_mineral: fila['TIPO DE MINERAL'],
        estructura_veta: fila['ESTRUCTURA/VETA'],
        nivel: fila['NIVEL'],
        block: fila['BLOCK'],
        labor: fila['LABOR'],
        ala: fila['ALA'],
        ancho_veta: fila['ANCHO DE VETA'],
        ancho_minado_sem: fila['ANCHO DE MINADO SEM'],
        ancho_minado_mes: fila['ANCHO DE MINADO MES'],
        ag_gr: fila['Ag gr'],
        porcentaje_cu: fila['%Cu'],
        porcentaje_pb: fila['%Pb'],
        porcentaje_zn: fila['%Zn'],
        vpt_act: fila['VPT ACT'],
        vpt_final: fila['VPT FINAL'],
        cut_off_1: fila['CUT OFF 1'],
        cut_off_2: fila['TONELAJE'],
        // Campos dinámicos 1A - 28B
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
    //console.log('PlanProduccion resultante:', plan); // Log 14: Plan después de mapear
    return plan;
}

async enviarDatosAlServidor(planes: PlanProduccion[]): Promise<void> {
    //console.log('Iniciando envío de datos al servidor. Total planes:', planes.length);
    this.mostrarPantallaCarga();

    let enviados = 0;
    let errores = 0;

    // Enviar registros uno por uno
    for (const [index, plan] of planes.entries()) {
        try {
            //console.log(`Enviando plan ${index + 1}/${planes.length}`, plan);
            const response = await this.planProduccionService.createPlanProduccion(plan).toPromise();
            //console.log(`Plan ${index + 1} enviado con éxito`, response);
            enviados++;
        } catch (error) {
            //console.error(`Error al enviar plan ${index + 1}:`, error);
            errores++;
        }
    }

    this.verificarCargaCompleta(planes.length, enviados, errores);
}

verificarCargaCompleta(total: number, enviados: number, errores: number): void {
    //console.log(`Progreso: ${enviados + errores}/${total} (Éxitos: ${enviados}, Errores: ${errores})`); // Log 19
    
    if (enviados + errores === total) {
        //console.log('Carga completada. Resumen:', { total, enviados, errores }); // Log 20
        this.dialog.closeAll();
        this.obtenerUltimaFecha();
        
        if (errores === 0) {
            //console.log('Todos los planes se cargaron correctamente'); // Log 21
            this._toastr.success('Los datos se cargaron correctamente', 'Carga exitosa', {
                closeButton: true,
                progressBar: true,
                timeOut: 5000
            });
        } else {
            //console.error(`Hubo ${errores} errores durante la carga`); // Log 22
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

editarPlan(plan: PlanProduccion): void {

  const dialogRef = this.dialog.open(EditPlanProduccionComponent, {
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
    if (confirm(`¿Está seguro de eliminar el plan del mes ${plan.mes}?`)) {
      
      // Llamar al servicio para eliminar el plan
    }
  }

  verPlan(plan: any): void {
    this.dialog.open(PlanProduccionDetallesDialogComponent, {
      width: '450px', // Ajusta el tamaño según necesites
      data: plan
    });
  }
  
}