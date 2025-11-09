import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '../../../../../models/meta.model';
import { MetaLargoService } from '../../../../../services/meta-largo.service';
import { DialogMetaComponent } from '../dialog-meta/dialog-meta.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogEditMetaComponent } from '../dialog-edit-meta/dialog-edit-meta.component';


@Component({
  selector: 'app-largo-meta-principal',
  imports: [CommonModule, FormsModule],
  templateUrl: './largo-meta-principal.component.html',
  styleUrl: './largo-meta-principal.component.css'
})
export class LargoMetaPrincipalComponent implements OnInit {
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  mesSeleccionado: string = '';
  areasConMetas: { nombre: string; periodo: string; metas: Meta[] }[] = [];
  private todasLasMetas: Meta[] = [];
  private areasBase: string[] = [
    'METROS PERFORADOS - EQUIPO',
    'METROS PERFORADOS - LABOR',
    'LONGITUD DE PERFORACION',
    'HOROMETROS',
    'ESTADOS DE EQUIPOS',
    'ESTADOS GENERAL',
    'DISPONIBILIDAD MECANICA - EQUIPO',
    'DISPONIBILIDAD MECANICA - GENERAL',
    'UTILIZACION - EQUIPO',
    'UTILIZACION - GENERAL',
    'RENDIMIENTO DE PERFORACION - EQUIPO',
    'PROMEDIO DE RENDIMIENTO',
    'SUMA DE METROS PERFORADOS' 
  ];

  constructor(private metaService: MetaLargoService, private dialog: MatDialog, private _toastr: ToastrService ) {} 

  ngOnInit() {
    const mesActual = new Date().getMonth();
    this.mesSeleccionado = this.meses[mesActual];
    this.cargarMetasDesdeApi();
  }

  private cargarMetasDesdeApi(): void {
    this.metaService.getMetas().subscribe({
      next: (metas: Meta[]) => {
        if (metas && metas.length > 0) {
          this.todasLasMetas = metas; // <<< GUARDAMOS UNA COPIA
          this.organizarMetasPorArea();
        } else {
          this.inicializarAreas();
        }
      },
      error: (error) => {
        console.error('Error al obtener las metas:', error);
        this.inicializarAreas();
      }
    });
  }

  private organizarMetasPorArea(): void {
    // Primero agrupamos por grafico
    const agrupadas: { [grafico: string]: Meta[] } = {};

    this.todasLasMetas.forEach(meta => {
      if (!agrupadas[meta.grafico]) {
        agrupadas[meta.grafico] = [];
      }
      agrupadas[meta.grafico].push(meta);
    });

    this.areasConMetas = this.areasBase.map(areaNombre => ({
      nombre: areaNombre,
      periodo: this.mesSeleccionado,
      metas: agrupadas[areaNombre]?.filter(meta =>
        meta.mes.toLowerCase() === this.mesSeleccionado.toLowerCase()
      ) || [this.crearMetaVacia(areaNombre)]
    }));
  }


  cambiarMes(mes: string): void {
    this.mesSeleccionado = mes;
    this.organizarMetasPorArea(); // <<< cuando cambies el mes, solo reorganizas filtrando
  }
  

  private inicializarAreas(): void {
    this.areasConMetas = this.areasBase.map(areaNombre => ({
      nombre: areaNombre,
      periodo: this.mesSeleccionado,
      metas: [this.crearMetaVacia(areaNombre)]
    }));
  }

  private crearMetaVacia(grafico: string): Meta {
    return {
      mes: this.mesSeleccionado,
      grafico: grafico,
      nombre: '',
      objetivo: 0
    };
  }

  eliminarMeta(areaIndex: number, metaIndex: number): void {
    const meta = this.areasConMetas[areaIndex].metas[metaIndex];
    
    // Verificar si la meta tiene un ID (existe en el backend)
    if (meta.id) {
      this.metaService.deleteMeta(meta.id).subscribe({
        next: () => {
          // Eliminar la meta de la lista local
          this.areasConMetas[areaIndex].metas.splice(metaIndex, 1);
          
          // Mostrar mensaje de éxito
          this._toastr.success('Meta eliminada correctamente', 'Éxito', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
  
          // Si no quedan metas, agregar una vacía
          if (this.areasConMetas[areaIndex].metas.length === 0) {
            this.agregarMetaVacia(areaIndex);
          }
        },
        error: (error) => {
          console.error('Error al eliminar la meta:', error);
          // Mostrar mensaje de error
          this._toastr.error('No se pudo eliminar la meta', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
        }
      });
    } else {
      // Si la meta no tiene ID (es una meta vacía), eliminamos localmente
      this.areasConMetas[areaIndex].metas.splice(metaIndex, 1);
      
      // Mostrar mensaje informativo (no es necesario para el usuario, pero puedes agregarlo)
      this._toastr.info('Meta local eliminada', 'Información', {
        timeOut: 2000,
        positionClass: 'toast-top-right'
      });
  
      if (this.areasConMetas[areaIndex].metas.length === 0) {
        this.agregarMetaVacia(areaIndex);
      }
    }
  }

    editarMeta(areaIndex: number, metaIndex: number): void {
      const meta = this.areasConMetas[areaIndex].metas[metaIndex];
      
      const dialogRef = this.dialog.open(DialogEditMetaComponent, {
        width: '400px',
        data: {
          mes: meta.mes,
          grafico: meta.grafico,
          nombre: meta.nombre,
          objetivo: meta.objetivo,
          id: meta.id // Pasamos el ID si existe para la actualización
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Si el usuario guardó los cambios
          const metaActualizada: Meta = {
            id: meta.id, // Mantenemos el mismo ID
            mes: result.mes,
            grafico: result.grafico,
            nombre: result.nombre,
            objetivo: result.objetivo
          };
    
          if (meta.id) {
            // Si la meta ya existe en el backend, la actualizamos
            this.metaService.updateMeta(meta.id, metaActualizada).subscribe({
              next: (metaActualizada) => {
                this._toastr.success('Meta actualizada correctamente', 'Éxito', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right'
                });
                this.cargarMetasDesdeApi(); // Recargamos las metas
              },
              error: (error) => {
                console.error('Error al actualizar la meta:', error);
                this._toastr.error('No se pudo actualizar la meta', 'Error', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right'
                });
              }
            });
          } else {
            // Si es una meta nueva que aún no se ha guardado, la creamos
            this.metaService.createMeta(metaActualizada).subscribe({
              next: (metaCreada) => {
                this._toastr.success('Meta guardada correctamente', 'Éxito', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right'
                });
                this.cargarMetasDesdeApi(); // Recargamos las metas
              },
              error: (error) => {
                console.error('Error al crear la meta:', error);
                this._toastr.error('No se pudo guardar la meta', 'Error', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right'
                });
              }
            });
          }
        }
      });
    }

  agregarMeta(areaIndex: number): void { 
    const grafico = this.areasConMetas[areaIndex].nombre;
  
    const dialogRef = this.dialog.open(DialogMetaComponent, {
      width: '400px',
      data: {
        mes: this.mesSeleccionado,
        grafico: grafico
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevaMeta: Meta = {
          mes: result.mes,
          grafico: result.grafico,
          nombre: result.nombre,
          objetivo: result.objetivo
        };
  
        // Llamamos al MetaService para crear la meta
        this.metaService.createMeta(nuevaMeta).subscribe({
          next: (metaCreada) => {
            // Mostrar notificación de éxito
            this._toastr.success('Meta creada correctamente', 'Éxito', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
  
            // Cerrar el diálogo (aunque después de afterClosed ya está cerrado)
            dialogRef.close(); 
  
            // Recargar las metas para mostrar la nueva
            this.cargarMetasDesdeApi();
          },
          error: (err) => {
            console.error('Error al crear la meta:', err);
            
            // Mostrar notificación de error
            this._toastr.error('No se pudo crear la meta', 'Error', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              progressBar: true
            });
          }
        });
      } else {
        // Opcional: Mostrar mensaje si el usuario cerró el diálogo sin guardar
        this._toastr.info('Operación cancelada', 'Información', {
          timeOut: 2000,
          positionClass: 'toast-top-right'
        });
      }
    });
  }
    

  private agregarMetaVacia(areaIndex: number): void {
    const grafico = this.areasConMetas[areaIndex].nombre;
    this.agregarNuevaMeta(areaIndex, this.mesSeleccionado, grafico, '', 0);
  }

  private agregarNuevaMeta(areaIndex: number, mes: string, grafico: string, nombre: string, objetivo: number): void {
    const nuevaMeta: Meta = { mes, grafico, nombre, objetivo };
    this.areasConMetas[areaIndex].metas.push(nuevaMeta);
  }

  subirMetas(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls, .csv';
    
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Mostrar notificación de carga
        const toastRef = this._toastr.info('Procesando archivo...', 'Cargando', {
          disableTimeOut: true,
          tapToDismiss: false
        });
        
        this.leerArchivoExcel(file).finally(() => {
          this._toastr.clear(toastRef.toastId);
        });
      }
    };
    
    fileInput.click();
  }
  
  private async leerArchivoExcel(file: File): Promise<void> {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const excelData = XLSX.utils.sheet_to_json(worksheet);
          
          this.procesarDatosExcel(excelData);
        } catch (error) {
          console.error('Error al procesar el archivo:', error);
          this._toastr.error('Formato de archivo inválido', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right'
          });
        }
      };
      
      reader.onerror = () => {
        this._toastr.error('Error al leer el archivo', 'Error', {
          timeOut: 3000
        });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error al importar xlsx:', error);
      this._toastr.error('Error al procesar el archivo', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right'
      });
    }
  }
  
  private procesarDatosExcel(datos: any[]): void {
    const metasParaCrear: Meta[] = [];
    let filasOmitidas = 0;
  
    datos.forEach(fila => {
      const mes = fila['MES']?.toString().trim() || this.mesSeleccionado;
      const grafico = fila['GRAFICO']?.toString().trim() || '';
      const nombre = fila['NOMBRE']?.toString().trim() || '';
      const objetivo = parseFloat(fila['OBJETIVO']) || 0;
  
      if (grafico && nombre && objetivo) {
        const nuevaMeta: Meta = {
          mes,
          grafico,
          nombre,
          objetivo
        };
        metasParaCrear.push(nuevaMeta);
      } else {
        filasOmitidas++;
        console.warn('Fila incompleta, se omitió:', fila);
      }
    });
  
    if (metasParaCrear.length > 0) {
      const totalMetas = metasParaCrear.length;
      let metasCreadas = 0;
      let errores = 0;
  
      // Notificación de progreso
      const progressToast = this._toastr.info(
        `Procesando ${metasParaCrear.length} metas...`, 
        'Cargando', 
        {
          disableTimeOut: true,
          tapToDismiss: false
        }
      );
  
      metasParaCrear.forEach(meta => {
        this.metaService.createMeta(meta).subscribe({
          next: () => {
            metasCreadas++;
            if (metasCreadas + errores === totalMetas) {
              this._toastr.clear(progressToast.toastId);
              this.mostrarResumenCarga(totalMetas, metasCreadas, errores, filasOmitidas);
              this.cargarMetasDesdeApi(); // Actualizar lista
            }
          },
          error: (error) => {
            console.error('Error al crear meta:', error);
            errores++;
            if (metasCreadas + errores === totalMetas) {
              this._toastr.clear(progressToast.toastId);
              this.mostrarResumenCarga(totalMetas, metasCreadas, errores, filasOmitidas);
            }
          }
        });
      });
  
    } else {
      this._toastr.warning(
        'No se encontraron metas válidas en el archivo', 
        'Advertencia', 
        {
          timeOut: 3000,
          positionClass: 'toast-top-right'
        }
      );
      
      if (filasOmitidas > 0) {
        this._toastr.info(
          `${filasOmitidas} filas omitidas por datos incompletos`, 
          'Información', 
          {
            timeOut: 4000
          }
        );
      }
    }
  }
  
  private mostrarResumenCarga(total: number, exitosas: number, errores: number, omitidas: number): void {
    if (errores === 0) {
      this._toastr.success(
        `Se crearon ${exitosas}/${total} metas correctamente`, 
        'Proceso completado', 
        {
          timeOut: 4000,
          enableHtml: true
        }
      );
    } else {
      this._toastr.error(
        `Se crearon ${exitosas}/${total} metas (${errores} errores)`, 
        'Proceso completado con errores', 
        {
          timeOut: 5000,
          enableHtml: true
        }
      );
    }
  
    if (omitidas > 0) {
      this._toastr.info(
        `${omitidas} filas omitidas por datos incompletos`, 
        'Filas omitidas', 
        {
          timeOut: 4000
        }
      );
    }
  }

}   