import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../Estado/confirm-dialog/confirm-dialog.component';
import { Pdf, Carpeta } from '../../../models/pdf.model';
import { PdfService } from '../../../services/pdf.service';
import { FormCreateComponent } from '../form-create/form-create.component';
import { PdfViewerDialogComponent } from '../pdf-viewer-dialog/pdf-viewer-dialog.component';
import { CarpetaService } from '../../../services/carpeta-pdf.service';
import { CarpetaFormDialogComponent } from '../carpeta-form-dialog/carpeta-form-dialog.component';

@Component({
  selector: 'app-list-pdf',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './list-pdf.component.html',
  styleUrl: './list-pdf.component.css'
})
export class ListPdfComponent implements OnInit {
  // Columnas para la tabla de PDFs
  displayedColumns: string[] = ['nombre', 'url_pdf', 'acciones'];
  dataSource = new MatTableDataSource<Pdf>();
  
  // Variables para carpetas
  carpetas: Carpeta[] = [];
  carpetaSeleccionada: Carpeta | null = null;

  // Mapa de conteo de PDFs por carpeta (id → cantidad)
  pdfCountMap: Record<number, number | undefined> = {};
  
  // Estado de carga
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private pdfService: PdfService, 
    private carpetaService: CarpetaService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarCarpetas();
    
    // Suscribirse a actualizaciones de PDFs
    this.pdfService.pdfsActualizados$.subscribe((actualizado) => {
      if (actualizado && this.carpetaSeleccionada) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada.id);
      }
    });
    
    // Suscribirse a actualizaciones de carpetas
    this.carpetaService.carpetasActualizados$.subscribe((actualizado) => {
      if (actualizado) {
        this.cargarCarpetas();
      }
    });
  }

  // Cargar todas las carpetas
  cargarCarpetas(): void {
    this.loading = true;
    this.carpetaService.getCarpetas().subscribe({
      next: (data: Carpeta[]) => {
        this.carpetas = data;
        this.loading = false;
        
        // Si hay carpetas y no hay una seleccionada, seleccionar la primera
        if (this.carpetas.length > 0 && !this.carpetaSeleccionada) {
          this.seleccionarCarpeta(this.carpetas[0]);
        }
      },
      error: (error) => {
        console.error('Error al obtener carpetas', error);
        this.loading = false;
      }
    });
  }

  // Seleccionar una carpeta y cargar sus PDFs
  seleccionarCarpeta(carpeta: Carpeta): void {
    this.carpetaSeleccionada = carpeta;
    this.cargarPdfsPorCarpeta(carpeta.id);
  }

  // Cargar PDFs de una carpeta específica
  cargarPdfsPorCarpeta(carpetaId: number): void {
    this.loading = true;
    this.pdfService.getPdfsPorCarpeta(carpetaId).subscribe({
      next: (data: Pdf[]) => {
        this.dataSource.data = data;
        // Actualizar el conteo en el mapa
        this.pdfCountMap[carpetaId] = data.length;
        this.loading = false;
        
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener PDFs de la carpeta', error);
        this.loading = false;
        this.dataSource.data = [];
      }
    });
  }

  // Aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Abrir diálogo para crear nueva carpeta
  abrirDialogoCrearCarpeta(): void {
    const dialogRef = this.dialog.open(CarpetaFormDialogComponent, {
      width: '400px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarCarpetas();
      }
    });
  }

  // Abrir diálogo para crear nuevo PDF
  abrirDialogoCrearPdf(): void {
    if (!this.carpetaSeleccionada) {
      this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          mensaje: 'Por favor, selecciona una carpeta primero para crear un PDF.',
          soloConfirmar: true
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(FormCreateComponent, {
      width: '450px',
      data: {
        carpetaId: this.carpetaSeleccionada.id,
        carpetaNombre: this.carpetaSeleccionada.nombre
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada!.id);
      }
    });
  }

  // Abrir diálogo para editar PDF
  abrirDialogoEditar(pdf: Pdf): void {
    const dialogRef = this.dialog.open(FormCreateComponent, {
      width: '450px',
      data: {
        carpetaId: this.carpetaSeleccionada?.id,
        carpetaNombre: this.carpetaSeleccionada?.nombre,
        pdf
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && this.carpetaSeleccionada) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada.id);
      }
    });
  }

  // Eliminar PDF
  eliminarPdf(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este PDF?' }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado && this.carpetaSeleccionada) {
        this.pdfService.deletePdf(id).subscribe({
          next: () => {
            this.cargarPdfsPorCarpeta(this.carpetaSeleccionada!.id);
          },
          error: (error) => console.error('Error al eliminar el PDF', error)
        });
      }
    });
  }

  // Ver PDF en diálogo
  verPdf(url: string): void {
    this.dialog.open(PdfViewerDialogComponent, {
      width: '90%',
      data: { url }
    });
  }
}