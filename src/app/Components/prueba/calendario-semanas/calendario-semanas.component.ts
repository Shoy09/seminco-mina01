import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SemanaService } from '../../../services/semana.service';
import { Semana } from '../../../models/semana.model';
import { Empresa } from '../../../models/empresa';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface DiaCalendario {
  fecha: Date;
  esHoy: boolean;
  esDomingo: boolean;
  esMesActual: boolean;
  semanaNumero?: number;
  semanaColor?: string;
  esSeleccionado: boolean;
  esInicio: boolean;
  esFin: boolean;
  esRango: boolean;
  esDeshabilitado: boolean; // Nuevo: para fechas anteriores a la última semana
}

@Component({
  selector: 'app-calendario-semanas',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule 
  ],
  templateUrl: './calendario-semanas.component.html',
  styleUrls: ['./calendario-semanas.component.css']
})
export class CalendarioSemanasComponent implements OnInit {
  empresa: Empresa;
  semanasExistentes: Semana[] = [];
  ultimaSemana: Semana | null = null;
  semanasNuevas: { numero: number, inicio: Date, fin: Date }[] = [];
  
  // Variables de calendario
  mesActual: Date = new Date();
  anioSeleccionado: number = new Date().getFullYear();
  diasCalendario: DiaCalendario[] = [];
  
  // Variables para selección
  seleccionActiva = false;
  fechaSeleccionInicio: Date | null = null;
  fechaSeleccionFin: Date | null = null;
  
  // Colores para visualización (16 colores distintos)
  coloresSemanas = [
    '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9',
    '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2',
    '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3',
    '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC'
  ];
  
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  anios: number[] = [];
  cargando = true;

  constructor(
    private semanaService: SemanaService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CalendarioSemanasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresa: Empresa }
  ) {
    this.empresa = data.empresa;
    this.generarAnios();
  }

  ngOnInit(): void {
    this.cargarSemanasExistentes();
  }

  generarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 2; i <= anioActual + 2; i++) {
      this.anios.push(i);
    }
  }

  cargarSemanasExistentes(): void {
    this.cargando = true;
    this.semanaService.getSemanas(this.empresa.id!).subscribe({
      next: (semanas) => {
        this.semanasExistentes = semanas;
        
        // Encontrar la última semana
        if (semanas.length > 0) {
          // Ordenar por año y número de semana
          semanas.sort((a, b) => {
            if (a.anio !== b.anio) return b.anio - a.anio;
            return b.numero_semana - a.numero_semana;
          });
          
          this.ultimaSemana = semanas[0];
          
          // Si hay última semana, ajustar el año y mes del calendario
          if (this.ultimaSemana) {
            const fechaFinUltima = new Date(this.ultimaSemana.fecha_fin);
            this.anioSeleccionado = fechaFinUltima.getFullYear();
            this.mesActual = new Date(fechaFinUltima.getFullYear(), fechaFinUltima.getMonth(), 1);
          }
        }
        
        this.generarCalendario();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar semanas:', err);
        this.cargando = false;
      }
    });
  }

  generarCalendario(): void {
    this.diasCalendario = [];
    
    const primerDiaMes = new Date(this.anioSeleccionado, this.mesActual.getMonth(), 1);
    const ultimoDiaMes = new Date(this.anioSeleccionado, this.mesActual.getMonth() + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const primerDiaCalendario = new Date(primerDiaMes);
    primerDiaCalendario.setDate(primerDiaCalendario.getDate() - primerDiaMes.getDay());
    
    // Días del mes siguiente para completar la última semana
    const ultimoDiaCalendario = new Date(ultimoDiaMes);
    ultimoDiaCalendario.setDate(ultimoDiaCalendario.getDate() + (6 - ultimoDiaMes.getDay()));
    
    const fechaActual = new Date();
    const fechaLimite = this.ultimaSemana ? new Date(this.ultimaSemana.fecha_fin) : null;
    
    for (let d = new Date(primerDiaCalendario); d <= ultimoDiaCalendario; d.setDate(d.getDate() + 1)) {
      const fecha = new Date(d);
      const esHoy = fecha.toDateString() === fechaActual.toDateString();
      const esDomingo = fecha.getDay() === 0;
      const esMesActual = fecha.getMonth() === this.mesActual.getMonth();
      
      // Verificar si la fecha está antes de la última semana
      const esDeshabilitado = fechaLimite ? fecha <= fechaLimite : false;
      
      // Buscar si la fecha pertenece a alguna semana existente
      let semanaInfo = this.encontrarSemanaParaFecha(fecha);
      
      this.diasCalendario.push({
        fecha: new Date(fecha),
        esHoy,
        esDomingo,
        esMesActual,
        semanaNumero: semanaInfo?.numero,
        semanaColor: semanaInfo?.color,
        esSeleccionado: this.esFechaSeleccionada(fecha),
        esInicio: this.esFechaInicio(fecha),
        esFin: this.esFechaFin(fecha),
        esRango: this.esEnRangoSeleccionado(fecha),
        esDeshabilitado
      });
    }
  }

  encontrarSemanaParaFecha(fecha: Date): { numero: number, color: string } | null {
    for (const semana of this.semanasExistentes) {
      const inicio = new Date(semana.fecha_inicio);
      const fin = new Date(semana.fecha_fin);
      
      if (fecha >= inicio && fecha <= fin) {
        // Generar un color único basado en el número de semana y año
        const hash = (semana.numero_semana * 37 + semana.anio) % this.coloresSemanas.length;
        return {
          numero: semana.numero_semana,
          color: this.coloresSemanas[hash]
        };
      }
    }
    return null;
  }

  esFechaSeleccionada(fecha: Date): boolean {
    if (!this.seleccionActiva || !this.fechaSeleccionInicio || !this.fechaSeleccionFin) {
      return false;
    }
    return fecha >= this.fechaSeleccionInicio && fecha <= this.fechaSeleccionFin;
  }

  esFechaInicio(fecha: Date): boolean {
    return this.fechaSeleccionInicio?.toDateString() === fecha.toDateString();
  }

  esFechaFin(fecha: Date): boolean {
    return this.fechaSeleccionFin?.toDateString() === fecha.toDateString();
  }

  esEnRangoSeleccionado(fecha: Date): boolean {
    return this.semanasNuevas.some(semana => 
      fecha >= semana.inicio && fecha <= semana.fin
    );
  }

  onFechaClick(fecha: Date, dia: DiaCalendario): void {
  if (dia.esDeshabilitado) return;

  if (!this.seleccionActiva) {
    // Para la primera fecha: si hay última semana forzar que sea después
    if (this.ultimaSemana) {
      const siguienteDiaUltimaSemana = new Date(this.ultimaSemana.fecha_fin);
      siguienteDiaUltimaSemana.setDate(siguienteDiaUltimaSemana.getDate() + 1);

      if (fecha < siguienteDiaUltimaSemana) {
        this.snackBar.open(
          `Debes empezar desde ${siguienteDiaUltimaSemana.toLocaleDateString()}, ya existe una semana previa`,
          'Cerrar',
          { duration: 3000 }
        );
        return;
      }
    }

    // Iniciar selección
    this.seleccionActiva = true;
    this.fechaSeleccionInicio = fecha;
    this.fechaSeleccionFin = fecha;
  } else {
    // Validar que la fecha final no sea igual a la inicial
    if (fecha.toDateString() === this.fechaSeleccionInicio!.toDateString()) {
      this.snackBar.open(
        'La fecha de inicio y fin no pueden ser la misma',
        'Cerrar',
        { duration: 3000 }
      );
      this.resetSeleccion();
      this.generarCalendario();
      return;
    }

    // Completar selección
    if (fecha < this.fechaSeleccionInicio!) {
      this.fechaSeleccionFin = this.fechaSeleccionInicio;
      this.fechaSeleccionInicio = fecha;
    } else {
      this.fechaSeleccionFin = fecha;
    }

    this.agregarSemanaSeleccionada();
  }

  this.generarCalendario();
}



agregarSemanaSeleccionada(): void {
  if (!this.fechaSeleccionInicio || !this.fechaSeleccionFin) return;

  // Validar mismo día (seguridad extra)
  if (this.fechaSeleccionInicio.toDateString() === this.fechaSeleccionFin.toDateString()) {
    this.snackBar.open(
      'La semana debe tener al menos 2 días, el inicio y fin no pueden ser iguales',
      'Cerrar',
      { duration: 3000 }
    );
    this.resetSeleccion();
    return;
  }

  // Validar continuidad con última semana registrada
  if (this.ultimaSemana) {
    const siguienteDiaUltimaSemana = new Date(this.ultimaSemana.fecha_fin);
    siguienteDiaUltimaSemana.setDate(siguienteDiaUltimaSemana.getDate() + 1);

    if (this.fechaSeleccionInicio.toDateString() !== siguienteDiaUltimaSemana.toDateString()) {
      this.snackBar.open(
        `La nueva semana debe comenzar el ${siguienteDiaUltimaSemana.toLocaleDateString()} para no dejar huecos`,
        'Cerrar',
        { duration: 4000 }
      );
      this.resetSeleccion();
      return;
    }
  }

  // Validar que no se solape con semanas nuevas o existentes
  const solapa =
    this.semanasNuevas.some(rango =>
      this.fechaSeleccionInicio! <= rango.fin && this.fechaSeleccionFin! >= rango.inicio
    ) ||
    this.semanasExistentes.some(rango => {
      const inicioExist = new Date(rango.fecha_inicio);
      const finExist = new Date(rango.fecha_fin);

      return (
        this.fechaSeleccionInicio! <= finExist &&
        this.fechaSeleccionFin! >= inicioExist
      );
    });

  if (solapa) {
    this.snackBar.open(
      'El rango seleccionado se solapa con uno existente',
      'Cerrar',
      { duration: 3000 }
    );
    this.resetSeleccion();
    return;
  }

  // Guardar rango nuevo
  this.semanasNuevas.push({
    numero: this.semanasNuevas.length + 1,
    inicio: new Date(this.fechaSeleccionInicio),
    fin: new Date(this.fechaSeleccionFin)
  });

  this.resetSeleccion();
  this.generarCalendario();
  this.snackBar.open('Semana agregada', 'Cerrar', { duration: 2000 });
}


  // Función para calcular el número de semana ISO
  getNumeroSemanaISO(fecha: Date): number {
    const target = new Date(fecha.valueOf());
    const dayNr = (fecha.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  resetSeleccion(): void {
    this.seleccionActiva = false;
    this.fechaSeleccionInicio = null;
    this.fechaSeleccionFin = null;
  }

  eliminarSemanaNueva(index: number): void {
    this.semanasNuevas.splice(index, 1);
    this.generarCalendario();
  }

  cambiarMes(direccion: number): void {
    this.mesActual = new Date(this.anioSeleccionado, this.mesActual.getMonth() + direccion, 1);
    this.generarCalendario();
  }

  onAnioChange(): void {
    this.mesActual = new Date(this.anioSeleccionado, this.mesActual.getMonth(), 1);
    this.generarCalendario();
  }

  irAlMesSiguiente(): void {
    if (this.ultimaSemana) {
      const fechaFin = new Date(this.ultimaSemana.fecha_fin);
      fechaFin.setDate(fechaFin.getDate() + 1); // Día siguiente al fin de la última semana
      this.anioSeleccionado = fechaFin.getFullYear();
      this.mesActual = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);
      this.generarCalendario();
    }
  }

  guardarSemanas(): void {
    if (this.semanasNuevas.length === 0) {
      this.snackBar.open('No hay semanas para guardar', 'Cerrar', { duration: 3000 });
      return;
    }

    const semanasParaGuardar = this.semanasNuevas.map(semana => ({
      numero_semana: semana.numero,
      anio: this.anioSeleccionado,
      fecha_inicio: semana.inicio.toISOString().split('T')[0],
      fecha_fin: semana.fin.toISOString().split('T')[0],
      empresa_id: this.empresa.id!
    }));

    // Guardar todas las semanas
    let guardadas = 0;
    const total = semanasParaGuardar.length;
    
    const guardarSiguiente = () => {
      if (guardadas >= total) {
        this.dialogRef.close('saved');
        return;
      }
      
      const semana = semanasParaGuardar[guardadas];
      this.semanaService.createSemana(this.empresa.id!, semana).subscribe({
        next: () => {
          guardadas++;
          guardarSiguiente();
        },
        error: (err) => {
          console.error(`Error al guardar semana ${semana.numero_semana}:`, err);
          guardadas++;
          guardarSiguiente();
        }
      });
    };

    guardarSiguiente();
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  // Función para obtener información de la última semana
  getInfoUltimaSemana(): string {
    if (!this.ultimaSemana) {
      return 'No hay semanas registradas';
    }
    
    const inicio = new Date(this.ultimaSemana.fecha_inicio);
    const fin = new Date(this.ultimaSemana.fecha_fin);
    
    return `Última semana: ${this.ultimaSemana.numero_semana} (${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()})`;
  }

  getTooltip(dia: DiaCalendario): string {
  const fechaStr = dia.fecha.toLocaleDateString();
  
  if (dia.esDeshabilitado) {
    if (dia.semanaNumero) {
      return `${fechaStr} - Semana ${dia.semanaNumero} (ya registrada)`;
    }
    return `${fechaStr} - Fecha bloqueada (anterior a la última semana)`;
  }
  
  if (dia.semanaNumero) {
    return `${fechaStr} - Semana ${dia.semanaNumero}`;
  }
  
  return `${fechaStr} - Haz clic para seleccionar`;
}
}