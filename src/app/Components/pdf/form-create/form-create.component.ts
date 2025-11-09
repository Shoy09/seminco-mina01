import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PdfService } from '../../../services/pdf.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlanMensualService } from '../../../services/plan-mensual.service';
import { PlanMetrajeService } from '../../../services/plan-metraje.service';
import { PlanProduccionService } from '../../../services/plan-produccion.service'; // Importar el nuevo servicio
import { PlanMensual } from '../../../models/plan-mensual.model';
import { PlanMetraje } from '../../../models/plan_metraje.model';
import { FechasPlanMensualService } from '../../../services/fechas-plan-mensual.service';

@Component({
  selector: 'app-form-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-create.component.html',
  styleUrl: './form-create.component.css'
})
export class FormCreateComponent implements OnInit {
  createForm!: FormGroup;
  pdfFile: File | null = null;
  
  // Datos estáticos
  meses: string[] = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL',
    'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
    'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  
  procesos: string[] = [
    'PERFORACIÓN TALADROS LARGOS', 
    'PERFORACIÓN HORIZONTAL', 
    'SOSTENIMIENTO', 
    'SERVICIOS AUXILIARES', 
    'CARGUÍO', 
    'ACARREO'
  ];
  
  anio: number | undefined;
  mes: string | undefined;
  
  // Datos dinámicos
  tiposLabor: string[] = [];
  labores: string[] = [];
  alas: string[] = [];
  
  // Almacenamiento de datos completos
  planesMensuales: PlanMensual[] = [];
  planesMetrajes: PlanMetraje[] = [];
  planesProduccion: any[] = []; // Cambiar a tipo específico si tienes el modelo
  
  // Procesos que usan planes mensuales
  procesosMensuales = ['PERFORACIÓN HORIZONTAL', 'SOSTENIMIENTO'];
  
  // Procesos que usan planes de metraje
  procesosMetrajes = ['SERVICIOS AUXILIARES'];

  // Procesos que usan planes de producción
  procesosProduccion = ['PERFORACIÓN TALADROS LARGOS', 'CARGUÍO', 'ACARREO']; // Ajustar según necesites

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfService,
    private router: Router,
    private planMensualService: PlanMensualService,
    private planMetrajeService: PlanMetrajeService,
    private planProduccionService: PlanProduccionService, // Inyectar el nuevo servicio
    private fechasPlanMensualService: FechasPlanMensualService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerUltimaFecha();
    
    // Escuchar cambios en el proceso seleccionado
    this.createForm.get('proceso')?.valueChanges.subscribe(proceso => {
      this.updateTipoLaborOptions(proceso);
    });
    
    // Escuchar cambios en el tipo de labor
    this.createForm.get('tipo_labor')?.valueChanges.subscribe(tipoLabor => {
      if (tipoLabor) {
        this.updateLaborOptions();
      }
    });
    
    // Escuchar cambios en la labor
    this.createForm.get('labor')?.valueChanges.subscribe(labor => {
      if (labor) {
        this.updateAlaOptions();
      }
    });
  }

  private initForm(): void {
    const mesActual = this.meses[new Date().getMonth()];
    this.createForm = this.fb.group({
      proceso: [this.procesos[0], Validators.required],
      mes: [mesActual, Validators.required],
      tipo_labor: ['', Validators.required],
      labor: ['', Validators.required],
      ala: [''], // Removido Validators.required para hacerlo opcional
      pdf: [null, Validators.required]
    });
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;
  
        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase();
          this.loadInitialData(anio, this.mes);
        } else {
          //console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        //console.error('Error al obtener la última fecha:', error);
      }
    );
  }

  private loadInitialData(anio: number, mes: string): void {
    // Cargar planes mensuales
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe({
      next: (data) => {
        this.planesMensuales = data;
        this.updateTipoLaborOptions(this.createForm.get('proceso')?.value);
      },
      error: (err) => console.error('Error cargando planes mensuales:', err)
    });

    // Cargar planes de metraje
    this.planMetrajeService.getPlanMensualByYearAndMonth(anio, mes).subscribe({
      next: (data) => {
        this.planesMetrajes = data;
        this.updateTipoLaborOptions(this.createForm.get('proceso')?.value);
      },
      error: (err) => console.error('Error cargando planes de metraje:', err)
    });

    // Nueva llamada: Cargar planes de producción
    this.planProduccionService.getPlanMensualByYearAndMonth(anio, mes).subscribe({
      next: (data) => {
        this.planesProduccion = data;
        this.updateTipoLaborOptions(this.createForm.get('proceso')?.value);
      },
      error: (err) => console.error('Error cargando planes de producción:', err)
    });
  }

  private getCurrentPlanes(): any[] {
    const proceso = this.createForm.get('proceso')?.value;
    
    if (this.procesosMensuales.includes(proceso)) {
      return this.planesMensuales;
    } else if (this.procesosMetrajes.includes(proceso)) {
      return this.planesMetrajes;
    } else if (this.procesosProduccion.includes(proceso)) {
      return this.planesProduccion;
    }
    return [];
  }

  private updateTipoLaborOptions(proceso: string): void {
    const planes = this.getCurrentPlanes();
    
    // Limpiar selects dependientes
    this.createForm.patchValue({ tipo_labor: '', labor: '', ala: '' });
    this.labores = [];
    this.alas = [];
    
    if (planes.length === 0) {
      this.tiposLabor = [];
      return;
    }
    
    // Obtener tipos de labor únicos
    const uniqueTipos = new Set<string>();
    planes.forEach(plan => {
      if (plan.tipo_labor) {
        uniqueTipos.add(plan.tipo_labor);
      }
    });
    
    this.tiposLabor = Array.from(uniqueTipos).sort();
    
    // Seleccionar primer valor si hay opciones
    if (this.tiposLabor.length > 0) {
      this.createForm.patchValue({ tipo_labor: this.tiposLabor[0] });
    }
  }

  private updateLaborOptions(): void {
    const tipoLabor = this.createForm.get('tipo_labor')?.value;
    const planes = this.getCurrentPlanes();
    
    // Limpiar selects dependientes
    this.createForm.patchValue({ labor: '', ala: '' });
    this.alas = [];
    
    if (!tipoLabor || planes.length === 0) {
      this.labores = [];
      return;
    }
    
    // Obtener labores únicas para el tipo seleccionado
    const uniqueLabores = new Set<string>();
    planes.forEach(plan => {
      if (plan.tipo_labor === tipoLabor && plan.labor) {
        uniqueLabores.add(plan.labor);
      }
    });
    
    this.labores = Array.from(uniqueLabores).sort();
    
    // Seleccionar primer valor si hay opciones
    if (this.labores.length > 0) {
      this.createForm.patchValue({ labor: this.labores[0] });
    }
  }

  private updateAlaOptions(): void {
    const tipoLabor = this.createForm.get('tipo_labor')?.value;
    const labor = this.createForm.get('labor')?.value;
    const planes = this.getCurrentPlanes();
    
    if (!tipoLabor || !labor || planes.length === 0) {
      this.alas = [];
      return;
    }
    
    // Obtener alas únicas para la labor seleccionada
    const uniqueAlas = new Set<string>();
    planes.forEach(plan => {
      if (plan.tipo_labor === tipoLabor && plan.labor === labor && plan.ala) {
        uniqueAlas.add(plan.ala);
      }
    });
    
    this.alas = Array.from(uniqueAlas).sort();
    
    // Si no hay alas disponibles, establecer el valor como vacío
    if (this.alas.length === 0) {
      this.createForm.patchValue({ ala: '' });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.pdfFile = file;
      this.createForm.patchValue({ pdf: file });
      this.createForm.get('pdf')?.setErrors(null); // Limpiar errores
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
      this.createForm.get('pdf')?.setErrors({ invalidType: true });
      this.pdfFile = null;
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid || !this.pdfFile) {
      this.markFormAsTouched();
      alert('Por favor completa todos los campos obligatorios y selecciona un PDF.');
      return;
    }

    const formData = this.prepareFormData();
    this.uploadPdf(formData);
  }

  private markFormAsTouched(): void {
    Object.values(this.createForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private prepareFormData(): FormData {
    const formData = new FormData();
    const formValues = this.createForm.value;
    
    Object.keys(formValues).forEach(key => {
      if (key !== 'pdf' && formValues[key]) {
        formData.append(key, String(formValues[key]).toUpperCase());
      }
    });
    
    if (this.pdfFile) {
      formData.append('archivo', this.pdfFile);
    }
    
    return formData;
  }

  private uploadPdf(formData: FormData): void {
    this.pdfService.createPdf(formData).subscribe({
      next: () => this.handleUploadSuccess(),
      error: (err) => this.handleUploadError(err)
    });
  }

  private handleUploadSuccess(): void {
    alert('PDF subido exitosamente.');
    this.resetForm();
  }

  private handleUploadError(error: any): void {
    console.error('Error al subir PDF:', error);
    alert('Ocurrió un error al subir el PDF. Por favor intenta nuevamente.');
  }

  private resetForm(): void {
    const mesActual = this.meses[new Date().getMonth()];
    this.createForm.reset({
      proceso: this.procesos[0],
      mes: mesActual,
      tipo_labor: '',
      labor: '',
      ala: ''
    });
    this.pdfFile = null;
    this.updateTipoLaborOptions(this.procesos[0]);
  }
}