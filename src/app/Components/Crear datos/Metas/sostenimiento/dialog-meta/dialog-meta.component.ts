import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-meta',
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-meta.component.html',
  styleUrls: ['./dialog-meta.component.css']  // Corregir de styleUrl a styleUrls
})
export class DialogMetaComponent {
  nombre: string = '';
  objetivo: number = 0;
  tipoMeta: string = '';
  etiquetaObjetivo: string = 'Objetivo';  
  etiquetaNombre: string = 'Nombre';         // Etiqueta dinámica
  placeholderObjetivo: string = 'Ingrese valor'; // Placeholder dinámico

  constructor(
    public dialogRef: MatDialogRef<DialogMetaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mes: string; grafico: string }
  ) {
    switch (data.grafico) {
      case 'METROS PERFORADOS - EQUIPO':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Metros Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Metros';
        break;
  
      case 'METROS PERFORADOS - LABOR':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Metros Objetivo';
        this.etiquetaNombre = 'Labor';
        this.placeholderObjetivo = 'Metros';
        break;
  
      case 'ESTADOS':
        this.tipoMeta = 'horas';
        this.etiquetaObjetivo = 'Horas Objetivo';
        this.etiquetaNombre = 'Estado';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'ESTADOS GENERAL':
        this.tipoMeta = 'horas';
        this.etiquetaObjetivo = 'Horas Objetivo';
        this.etiquetaNombre = 'Estado';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'MALLA - EQUIPO':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Malla Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Metros';
        break;
  
      case 'MALLA - LABOR':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Malla Objetivo';
        this.etiquetaNombre = 'Labor';
        this.placeholderObjetivo = 'Metros';
        break;
  
      case 'HOROMETROS':
        this.tipoMeta = 'horas';
        this.etiquetaObjetivo = 'Horas Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'RENDIMIENTO DE PERFORACION - EQUIPO':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Rendimiento Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Metros m/h';
        break;
  
      case 'DISPONIBILIDAD MECANICA - EQUIPO':
        this.tipoMeta = 'promedios';
        this.etiquetaObjetivo = 'Disponibilidad Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'DISPONIBILIDAD MECANICA - GENERAL':
        this.tipoMeta = 'promedio';
        this.etiquetaObjetivo = 'Disponibilidad Objetivo';
        this.etiquetaNombre = 'Estado';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'UTILIZACION - EQUIPO':
        this.tipoMeta = 'promedios';
        this.etiquetaObjetivo = 'Utilización Objetivo';
        this.etiquetaNombre = 'Equipo';
        this.placeholderObjetivo = 'Horas';
        break;
  
      case 'UTILIZACION - GENERAL':
        this.tipoMeta = 'promedio';
        this.etiquetaObjetivo = 'Utilización Objetivo';
        this.etiquetaNombre = 'Estado';
        this.placeholderObjetivo = 'Horas';
        break;
      
        case 'PROMEDIO DE RENDIMIENTO':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Rendimiento Objetivo';
        this.etiquetaNombre = 'Promedio';
        this.placeholderObjetivo = 'Metros m/h';
        break;
      
      case 'SUMA DE METROS PERFORADOS':
        this.tipoMeta = 'metros';
        this.etiquetaObjetivo = 'Rendimiento Objetivo';
        this.etiquetaNombre = 'Promedio';
        this.placeholderObjetivo = 'Metros';
        break;
  
      default:
        this.tipoMeta = '';
        this.etiquetaNombre = 'Nombre';
        this.etiquetaObjetivo = 'Objetivo';
        this.placeholderObjetivo = 'Ingrese valor';
        break;
    }
  }
  

  guardar() {
    // Al guardar, se cierra el dialog y envía los datos al componente padre
    this.dialogRef.close({
      mes: this.data.mes,
      grafico: this.data.grafico,
      nombre: this.nombre,
      objetivo: this.objetivo
    });
  }

  cancelar() {
    // Solo cierra el dialog sin hacer nada
    this.dialogRef.close();
  }
}
