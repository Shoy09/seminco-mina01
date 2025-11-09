import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../Estado/confirm-dialog/confirm-dialog.component';
import { Pdf } from '../../../models/pdf.model';
import { PdfService } from '../../../services/pdf.service';
import { FormCreateComponent } from '../form-create/form-create.component';
import { PdfViewerDialogComponent } from '../pdf-viewer-dialog/pdf-viewer-dialog.component';

@Component({
  selector: 'app-list-pdf',
  imports: [ReactiveFormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './list-pdf.component.html',
  styleUrl: './list-pdf.component.css'
})
export class ListPdfComponent implements OnInit {
  displayedColumns: string[] = ['proceso', 'mes', 'tipo_labor', 'labor', 'ala', 'url_pdf', 'acciones'];
  dataSource = new MatTableDataSource<Pdf>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pdfService: PdfService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getPdfs();

    this.pdfService.pdfsActualizados$.subscribe((actualizado) => {
      if (actualizado) {
        this.getPdfs(); // Recarga cuando se detecta un cambio
      }
    });
  }

  getPdfs(): void {
    this.pdfService.getPdfs().subscribe(
      (data: Pdf[]) => {
        this.dataSource.data = data;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      },
      (error: any) => {
        console.error('Error al obtener los PDFs', error);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  abrirDialogoEditar(pdf: Pdf) {
    // Aquí puedes abrir tu dialogo de edición si lo tienes creado
    console.log('Editar PDF:', pdf);
  }

  eliminarPdf(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este PDF?' }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.pdfService.deletePdf(id).subscribe(
          () => this.getPdfs(),
          (error) => console.error('Error al eliminar el PDF', error)
        );
      }
    });
  }

  abrirSeleccionProcesoDialogo() {
    const dialogRef = this.dialog.open(FormCreateComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.getPdfs();
      }
    });
  }
  
  verPdf(url: string): void {
  this.dialog.open(PdfViewerDialogComponent, {
    width: '90%',
    data: { url }
  });
}
}