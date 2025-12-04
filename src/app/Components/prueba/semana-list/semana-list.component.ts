import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SemanaService } from '../../../services/semana.service';
import { Semana } from '../../../models/semana.model';
import { SemanaDialogComponent } from '../semana-dialog/semana-dialog.component';
import * as XLSX from 'xlsx';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../models/empresa';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalendarioSemanasComponent } from '../calendario-semanas/calendario-semanas.component';

@Component({
  selector: 'app-semana-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
],
  templateUrl: './semana-list.component.html',
  styleUrl: './semana-list.component.css'
})
export class SemanaListComponent implements OnInit {
  semanas: Semana[] = [];
  empresas: Empresa[] = []; // Lista de empresas
  empresaSeleccionada?: number; // Empresa seleccionada
  displayedColumns: string[] = ['numero_semana', 'anio', 'fecha_inicio', 'fecha_fin', 'acciones'];

  constructor(
    private semanaService: SemanaService,
    private empresaService: EmpresaService, // Inyectar servicio de empresas
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.empresaService.getEmpresa().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        if (empresas.length > 0) {
          this.empresaSeleccionada = empresas[0].id;
          this.cargarSemanas();
        }
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.snackBar.open('Error al cargar empresas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarSemanas(): void {
    if (!this.empresaSeleccionada) return;

    this.semanaService.getSemanas(this.empresaSeleccionada).subscribe({
      next: (semanas) => {
        this.semanas = semanas.sort((a, b) => {
          if (a.anio !== b.anio) return b.anio - a.anio;
          return b.numero_semana - a.numero_semana;
        });
      },
      error: (err) => {
        console.error('Error al cargar semanas:', err);
        this.snackBar.open('Error al cargar semanas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onEmpresaChange(): void {
    this.cargarSemanas();
  }

  getNombreEmpresa(id: number): string {
    const empresa = this.empresas.find(e => e.id === id);
    return empresa ? empresa.nombre : 'Empresa no encontrada';
  }
  

openDialog(semana?: Semana): void {
  if (!this.empresaSeleccionada) {
    this.snackBar.open('Debe seleccionar una empresa', 'Cerrar', { duration: 3000 });
    return;
  }

  const empresaSeleccionada = this.empresas.find(e => e.id === this.empresaSeleccionada);
  
  if (!empresaSeleccionada) {
    this.snackBar.open('Empresa no encontrada', 'Cerrar', { duration: 3000 });
    return;
  }

  const dialogRef = this.dialog.open(SemanaDialogComponent, {
    width: '500px',
    data: { 
      semana: semana || null,
      empresa: empresaSeleccionada
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.cargarSemanas();
    }
  });
}

  eliminarSemana(id: number): void {
    if (!this.empresaSeleccionada) return;

    if (confirm('¿Estás seguro de eliminar esta semana?')) {
      this.semanaService.deleteSemana(this.empresaSeleccionada, id).subscribe({
        next: () => {
          this.snackBar.open('Semana eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarSemanas();
        },
        error: (err) => {
          console.error('Error al eliminar semana:', err);
          this.snackBar.open('Error al eliminar semana', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  seleccionarArchivo(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

cargarArchivo(event: any): void {
  if (!this.empresaSeleccionada) {
    this.snackBar.open('Por favor, seleccione una empresa primero', 'Error', { duration: 5000 });
    return;
  }

  const archivo = event.target.files[0];
  if (!archivo) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      this.snackBar.open(`No se pudo leer la hoja del archivo.`, 'Error', { duration: 5000 });
      return;
    }

    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
    const semanasValidas: Semana[] = [];
    const errores: string[] = [];
    const numerosSemanaExistentes = this.semanas.map(s => s.numero_semana);

    jsonData.forEach((fila: any, index: number) => {
      try {
        const semana: Semana = {
          numero_semana: fila["Número de Semana"] || fila["Semana"] || fila["No. Semana"],
          anio: fila["Año"] || fila["Anio"] || new Date().getFullYear(),
          fecha_inicio: this.formatearFecha(fila["Fecha Inicio"] || fila["Inicio"]),
          fecha_fin: this.formatearFecha(fila["Fecha Fin"] || fila["Fin"]),
          empresa_id: this.empresaSeleccionada! // Añadir empresa_id automáticamente
        };

        if (!semana.numero_semana || !semana.fecha_inicio || !semana.fecha_fin) {
          throw new Error('Faltan campos obligatorios');
        }

        if (numerosSemanaExistentes.includes(semana.numero_semana)) {
          throw new Error(`La semana ${semana.numero_semana} ya existe para esta empresa`);
        }

        semanasValidas.push(semana);
      } catch (error) {
        errores.push(`Fila ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    if (semanasValidas.length === 0) {
      this.snackBar.open('No hay semanas válidas para importar.', 'Error', { duration: 5000 });
      return;
    }

    this.enviarSemanasAlServidor(semanasValidas);

    if (errores.length > 0) {
      this.snackBar.open(
        `Se importaron ${semanasValidas.length} semanas, pero hubo ${errores.length} errores.`,
        'Advertencia',
        { duration: 7000 }
      );
    }
  };

  reader.readAsArrayBuffer(archivo);
}

  private formatearFecha(fechaExcel: any): string {
    // Si es un número (formato Excel), convertirlo a fecha
    if (typeof fechaExcel === 'number') {
      const fecha = XLSX.SSF.parse_date_code(fechaExcel);
      return new Date(fecha.y, fecha.m - 1, fecha.d).toISOString().split('T')[0];
    }
    
    // Si ya es una cadena, intentar formatearla
    if (typeof fechaExcel === 'string') {
      // Eliminar espacios y convertir a formato YYYY-MM-DD
      const fecha = new Date(fechaExcel.trim());
      if (!isNaN(fecha.getTime())) {
        return fecha.toISOString().split('T')[0];
      }
    }
    
    throw new Error('Formato de fecha no válido');
  }

private enviarSemanasAlServidor(semanas: Semana[]): void {
  if (!this.empresaSeleccionada) return;

  this.mostrarPantallaCarga();
  
  let enviados = 0;
  let errores = 0;
  
  semanas.forEach((semana, index) => {
    this.semanaService.createSemana(this.empresaSeleccionada!, semana).subscribe({
      next: () => {
        enviados++;
        this.verificarCargaCompleta(semanas.length, enviados, errores);
      },
      error: (error) => {
        console.error(`Error al crear semana ${index + 1}:`, error);
        errores++;
        this.verificarCargaCompleta(semanas.length, enviados, errores);
      }
    });
  });
}

  private verificarCargaCompleta(total: number, enviados: number, errores: number): void {
    if (enviados + errores === total) {
      this.dialog.closeAll();
      this.cargarEmpresas();
      
      if (errores === 0) {
        this.snackBar.open(`${enviados} semanas importadas correctamente.`, 'Éxito', { duration: 5000 });
      } else {
        this.snackBar.open(
          `Se importaron ${enviados} semanas, pero hubo ${errores} errores.`,
          'Advertencia',
          { duration: 7000 }
        );
      }
    }
  }

  private mostrarPantallaCarga(): void {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      data: { mensaje: 'Importando semanas...' }
    });
  }

  openCalendario(): void {
  if (!this.empresaSeleccionada) {
    this.snackBar.open('Debe seleccionar una empresa', 'Cerrar', { duration: 3000 });
    return;
  }

  const empresaSeleccionada = this.empresas.find(e => e.id === this.empresaSeleccionada);
  
  if (!empresaSeleccionada) {
    this.snackBar.open('Empresa no encontrada', 'Cerrar', { duration: 3000 });
    return;
  }

  const dialogRef = this.dialog.open(CalendarioSemanasComponent, {
    width: '900px',
    maxWidth: '95vw',
    data: { empresa: empresaSeleccionada }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'saved') {
      this.cargarSemanas();
    }
  });
}
}

