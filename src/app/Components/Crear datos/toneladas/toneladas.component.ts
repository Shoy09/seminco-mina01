import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToneladasService } from '../../../services/toneladas.service';
import * as XLSX from 'xlsx';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-toneladas',
  imports: [FormsModule, CommonModule],
  templateUrl: './toneladas.component.html',
  styleUrl: './toneladas.component.css'
})
export class ToneladasComponent implements OnInit {
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: any = {}
  formularioActivo: string = 'botones';  
  years: number[] = []; 
  tiposAceroData: any[] = [];

  filtroLabor: string = '';
  filtroFecha: string = '';
  datosFiltrados: any[] = [];
   filtrosActivos: boolean = false;

  editando: boolean = false;
indiceEditando: number = -1;
datoOriginal: any = null;
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  datos = [
    { nombre: 'Reporte A', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte B', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte C', year: '2024', mes: 'Enero' }
  ];

  constructor(
    private toneladasService: ToneladasService,
    private dialog: MatDialog

  ) {} // Inyecta los servicios

  ngOnInit() {
    this.generarAños();
  }

  generarAños() {
    const yearActual = new Date().getFullYear();
    for (let i = 2020; i <= yearActual; i++) {
      this.years.push(i);
    }
  }

  mostrarFormulario(formulario: string): void {
    this.formularioActivo = formulario;
  }

  buttonc = [
    
    {
  nombre: 'Toneladas',
  icon: 'mas.svg',
  tipo: 'Toneladas',
  datos: [],
  campos: [
    { nombre: 'fecha', label: 'Fecha', tipo: 'date' },
    { nombre: 'zona', label: 'Zona', tipo: 'text' },
    { nombre: 'tipo', label: 'Tipo', tipo: 'text' },
    { nombre: 'labor', label: 'Labor', tipo: 'text' },
    { nombre: 'toneladas', label: 'Toneladas', tipo: 'number' }
  ]
},

    
  ];  

  cerrarModal() {
    this.modalAbierto = false;
    this.modalContenido = null;
  }

  triggerFileInput() {
    // Simula el clic en el input de archivo cuando se hace clic en el botón "Importar Excel"
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  
  importarExcel() {
    if (this.modalContenido) {
      this.cargarExcel(this.modalContenido.nombre);
    } else {
      
    }
  }

  editarDato(dato: any, index: number) {
  this.editando = true;
  this.indiceEditando = index;
  this.datoOriginal = {...dato};
  
  // Clonamos el dato para editarlo
  this.nuevoDato = {...dato};
}

// Función para actualizar un registro
actualizarDatos() {
  if (Object.values(this.nuevoDato).some(val => val !== '')) {
    const datosActualizados = {...this.nuevoDato};
    const id = this.modalContenido.datos[this.indiceEditando].id;

     if (this.modalContenido.tipo === 'Toneladas') {
      this.toneladasService.updateTonelada(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar Toneladas:', err)
      });
    }
    // Agregar más casos según necesites, como 'Fechas Plan Mensual', 'Toneladas', etc.
  }
}


// Función para cancelar la edición
cancelarEdicion() {
  this.editando = false;
  this.indiceEditando = -1;
  this.nuevoDato = {};
  this.datoOriginal = null;
}

cargarExcel(nombre: string) {
  if (nombre === 'Equipo' || nombre === 'Toneladas' || nombre === 'Acero' || 
      nombre === 'Jefe Guardia Acero' || nombre === 'Operador Acero') {
    this.triggerFileInput(); // Activa la selección de archivo
  } else {
    console.warn('Importación de Excel no implementada para:', nombre);
  }
}

  procesarArchivoExcel(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // Determinar qué función de procesamiento usar basado en el contenido del modal
  if (this.modalContenido) {
    switch (this.modalContenido.nombre) {
      case 'Toneladas':
        this.procesarExcelToneladas(event);
        break;
      default:
        console.warn('No hay procesador definido para:', this.modalContenido.nombre);
        break;
    }
  }

  // Limpiar el input file para permitir subir el mismo archivo otra vez
  event.target.value = '';
}

private buscarHojaExcel(workbook: any, nombresPosibles: string[]): string {
  // Buscar por nombres exactos primero
  for (const nombre of nombresPosibles) {
    if (workbook.SheetNames.includes(nombre)) {
      return nombre;
    }
  }
  
  // Buscar por nombres que contengan las palabras (case insensitive)
  const nombresDisponibles = workbook.SheetNames;
  for (const nombreBuscado of nombresPosibles) {
    const hojaEncontrada = nombresDisponibles.find((nombreHoja: string) => 
      nombreHoja.toLowerCase().includes(nombreBuscado.toLowerCase())
    );
    if (hojaEncontrada) {
      return hojaEncontrada;
    }
  }
  
  // Si no encuentra ninguna, devolver la primera hoja como fallback
  console.warn('No se encontró ninguna hoja con los nombres:', nombresPosibles, 'usando primera hoja');
  return workbook.SheetNames[0];
}


procesarExcelToneladas(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const toneladas = excelData.map(row => ({
      fecha: row["FECHA"] || null,
      turno: row["TURNO"] || null,
      zona: row["ZONA"] || null,
      tipo: row["TIPO"] || null,
      labor: row["LABOR"] || null,
      toneladas: row["TONELADAS"] ? Number(row["TONELADAS"]) : 0
    }));

    // 🟢 Guardamos referencia antes de cerrar el modal
    const modalActual = this.modalContenido;
    this.cerrarModal();
    this.mostrarPantallaCarga();

    this.toneladasService.createToneladasMasivo(toneladas).subscribe({
      next: (data) => {
        modalActual.datos.push(...data);
        this.dialog.closeAll();
      },
      error: (err) => {
        console.error('Error al guardar Toneladas:', err);
        this.dialog.closeAll();
      }
    });
  };

  reader.readAsArrayBuffer(file);
}

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  
  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;
    this.limpiarFiltros(); 

   if (button.tipo === 'Toneladas') {
  this.toneladasService.getToneladas().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
          this.datosFiltrados = [...data]; // Inicializar con todos los datos
          this.filtrosActivos = false; // No hay filtros aplicados inicialmente
    },
    error: (err) => console.error('Error al cargar Toneladas:', err)
  });
}

  }

   aplicarFiltros() {
    if (!this.modalContenido?.datos) return;

    // Verificar si hay algún filtro activo
    this.filtrosActivos = this.filtroLabor !== '' || this.filtroFecha !== '';

    // Si no hay filtros activos, mostrar todos los datos
    if (!this.filtrosActivos) {
      this.datosFiltrados = [...this.modalContenido.datos];
      return;
    }

    let datosFiltrados = [...this.modalContenido.datos];

    // Filtrar por labor (búsqueda parcial case insensitive)
    if (this.filtroLabor) {
      datosFiltrados = datosFiltrados.filter(dato => 
        dato.labor && dato.labor.toLowerCase().includes(this.filtroLabor.toLowerCase())
      );
    }

    // Filtrar por fecha (formato YYYY-MM-DD)
    if (this.filtroFecha) {
      datosFiltrados = datosFiltrados.filter(dato => 
        dato.fecha === this.filtroFecha
      );
    }

    this.datosFiltrados = datosFiltrados;
  }

  // Método para limpiar filtros
  limpiarFiltros() {
    this.filtroLabor = '';
    this.filtroFecha = '';
    this.filtrosActivos = false;
    if (this.modalContenido?.datos) {
      this.datosFiltrados = [...this.modalContenido.datos];
    }
  }

  onCampoChange(nombreCampo: string) {
  // Solo actuamos si el campo modificado es 'proceso'
  if (nombreCampo === 'proceso' && this.modalContenido.tipo === 'Acero') {
    const procesoSeleccionado = this.nuevoDato['proceso'];

    // Filtrar tipos de acero que pertenecen a ese proceso
    const tiposFiltrados = this.tiposAceroData
      .filter(t => t.proceso === procesoSeleccionado)
      .map(t => t.tipo_acero);

    // Actualizar dinámicamente el select de tipo_acero
    const campoTipoAcero = this.modalContenido.campos.find((c: { nombre: string; }) => c.nombre === 'tipo_acero');
    if (campoTipoAcero) {
      campoTipoAcero.opciones = tiposFiltrados;
    }

    // Limpiar selección previa
    this.nuevoDato['tipo_acero'] = '';
  }
}


  guardarDatos() {
    if (Object.values(this.nuevoDato).some(val => val !== '')) {
      const nuevoRegistro = { ...this.nuevoDato };


      
       if (this.modalContenido.tipo === 'Toneladas') {
  this.toneladasService.createToneladasMasivo(nuevoRegistro).subscribe({
    next: (data) => {
      this.modalContenido.datos.push(data);
    },
    error: (err) => console.error('Error al guardar Toneladas:', err)
  });
}
      this.nuevoDato = {};
    }
  }

  eliminar(item: any): void {
    if (!item || !this.modalContenido) return;

     if (this.modalContenido.tipo === 'Toneladas') {
  this.toneladasService.deleteTonelada(item.id).subscribe({
    next: () => {
      this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
    },
    error: (err) => console.error('Error al eliminar Tonelada:', err)
  });
}

  }

  descargar(item: any): void {}
}