import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EstadoFormComponent } from '../estado-form/estado-form.component';
import { EstadoFormEditarComponent } from '../estado-form-editar/estado-form-editar.component';
import { OpcionesDialogComponent } from '../opciones-dialog/opciones-dialog.component';
import * as XLSX from 'xlsx';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { SeleccionProcesoEstatosDialogComponent } from '../seleccion-proceso-estatos-dialog/seleccion-proceso-estatos-dialog.component';
import { Estado } from '../../../models/Estado';
import { EstadoService } from '../../../services/estado.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-estados',
  imports: [ReactiveFormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './estados.component.html',
  styleUrl: './estados.component.css'
})
export class EstadosComponent implements OnInit {
  displayedColumns: string[] = ['estado_principal', 'codigo', 'tipo_estado', 'categoria', 'proceso', 'acciones'];
  dataSource = new MatTableDataSource<Estado>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private estadoService: EstadoService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getEstados();
    this.estadoService.getEstadoActualizado().subscribe(cambio => {
      if (cambio) {
        this.getEstados(); // Recargar la tabla cuando haya cambios
      }
    });
  }
  

  getEstados(): void {
    this.estadoService.getEstados().subscribe(
      (data: Estado[]) => {
        this.dataSource.data = data;
  
        // Importante: Forzar actualización del paginador
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage(); // Regresar a la primera página para evitar inconsistencias
        }
      },
      (error: any) => {
        console.error('Error al obtener los estados', error);
      }
    );
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  
  abrirDialogoEditar(estado: Estado) {
    const dialogRef = this.dialog.open(EstadoFormEditarComponent, {
      width: '700px',
      data: estado, // Pasamos el estado seleccionado
      autoFocus: false
    });
  
    dialogRef.afterClosed().subscribe((estadoEditado) => {
      if (estadoEditado) {
        this.getEstados(); // Volver a cargar los estados si hubo cambios
      }
    });
  }
  
  eliminarEstado(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este estado?' }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.estadoService.deleteEstado(id).subscribe(
          () => {
            this.getEstados(); // Refrescar la lista después de eliminar
          },
          (error) => {
            console.error('Error al eliminar el estado', error);
          }
        );
      }
    });
  }

  abrirSeleccionProcesoDialogo() {
    const dialogRef = this.dialog.open(SeleccionProcesoEstatosDialogComponent, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe((procesoSeleccionado) => {
      if (procesoSeleccionado) {
        
      }
    });
  }
  

  // abrirDialogoOpciones() {
  //   const dialogRef = this.dialog.open(OpcionesDialogComponent, {
  //     width: '400px'
  //   });
  
  //   dialogRef.afterClosed().subscribe((opcion) => {
  //     if (opcion === 'estado') {
  //       this.abrirDialogo();
  //     } else if (opcion === 'excel') {
  //       this.abrirExploradorArchivos();
  //     }
  //   });
  // }
  
}