import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechasPlanMensualService } from '../../../services/fechas-plan-mensual.service';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { EmpresaService } from '../../../services/empresa.service';
import { EquipoService } from '../../../services/equipo.service';
import { TipoPerforacionService } from '../../../services/tipo-perforacion.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { ToneladasService } from '../../../services/toneladas.service';
import { ProcesoAceroService } from '../../../services/proceso-acero.service';
import { OperadorAceroService } from '../../../services/operador-acero.service';
import { JefeGuardiaAceroService } from '../../../services/jefe-guardia-acero.service';
import { TipoAceroService } from '../../../services/tipo-acero.service';


@Component({
  selector: 'app-crear-data',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-data.component.html',
  styleUrl: './crear-data.component.css'
})
export class CrearDataComponent implements OnInit {
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: any = {}
  formularioActivo: string = 'botones';  
  years: number[] = []; 
  tiposAceroData: any[] = [];

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
    private tipoPerforacionService: TipoPerforacionService, 
    private equipoService: EquipoService,
    private ProcesoAceroService: ProcesoAceroService,
    private empresaService: EmpresaService,
    private FechasPlanMensualService: FechasPlanMensualService,
    private toneladasService: ToneladasService,
    private jefeGuardiaAceroService: JefeGuardiaAceroService,
    private operadorAceroService: OperadorAceroService,
    private tipoAceroService: TipoAceroService,
    public dialog: MatDialog
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
  nombre: 'Tipo de Perforación',
  icon: 'mas.svg',
  tipo: 'Tipo de Perforación',
  datos: [],
  campos: [
    { nombre: 'nombre', label: 'Tipo de Perforación', tipo: 'text' },
    { 
      nombre: 'proceso', 
      label: 'Proceso', 
      tipo: 'select', 
      opciones: [
        'PERFORACIÓN TALADROS LARGOS',
        'PERFORACIÓN HORIZONTAL',
        'SOSTENIMIENTO',
        'SERVICIOS AUXILIARES',
        'CARGUÍO'
      ]
    },
  ]
},
    {
      nombre: 'Equipo',
      icon: 'mas.svg',
      tipo: 'Equipo',
      datos: [],
      campos: [
        { nombre: 'nombre', label: 'Nombre', tipo: 'text' },
        { nombre: 'proceso', label: 'Proceso', tipo: 'text' },
        { nombre: 'codigo', label: 'Código', tipo: 'text' },
        { nombre: 'marca', label: 'Marca', tipo: 'text' },
        { nombre: 'modelo', label: 'Modelo', tipo: 'text' },
        { nombre: 'serie', label: 'Serie', tipo: 'text' },
        { nombre: 'anioFabricacion', label: 'Año de Fabricación', tipo: 'number' },
        { nombre: 'fechaIngreso', label: 'Fecha de Ingreso', tipo: 'date' },
        { nombre: 'capacidadYd3', label: 'Capacidad (Yd³)', tipo: 'number' },
        { nombre: 'capacidadM3', label: 'Capacidad (m³)', tipo: 'number' }
      ]
    },
    {
      nombre: 'Empresa',
      icon: 'mas.svg',
      tipo: 'Empresa',
      datos: [],
      campos: [
        { nombre: 'nombre', label: 'Empresa', tipo: 'text' },
      ]
    },
    {
      nombre: 'Fechas Plan Mensual',
      icon: 'mas.svg',
      tipo: 'Fechas Plan Mensual',
      datos: [],
      campos: [
        { nombre: 'mes', label: 'Mes', tipo: 'text' },
      ]
    },
//     {
//   nombre: 'Toneladas',
//   icon: 'mas.svg',
//   tipo: 'Toneladas',
//   datos: [],
//   campos: [
//     { nombre: 'fecha', label: 'Fecha', tipo: 'date' },
//     { nombre: 'zona', label: 'Zona', tipo: 'text' },
//     { nombre: 'tipo', label: 'Tipo', tipo: 'text' },
//     { nombre: 'labor', label: 'Labor', tipo: 'text' },
//     { nombre: 'toneladas', label: 'Toneladas', tipo: 'number' }
//   ]
// },
{
  nombre: 'Tipo de Acero',
  icon: 'mas.svg',
  tipo: 'Tipo de Acero',
  datos: [],
  campos: [
    { 
      nombre: 'proceso', 
      label: 'Proceso', 
      tipo: 'select', 
      opciones: [
        'PERFORACIÓN TALADROS LARGOS',
        'PERFORACIÓN HORIZONTAL',
        'SOSTENIMIENTO',
        'SERVICIOS AUXILIARES',
        'CARGUÍO'
      ]
    },
    { 
      nombre: 'tipo_acero', 
      label: 'Tipo de Acero', 
      tipo: 'text'
    }
  ]
},
{
  nombre: 'Acero',
  icon: 'mas.svg',
  tipo: 'Acero',
  datos: [],
  campos: [
    { 
      nombre: 'proceso', 
      label: 'Proceso', 
      tipo: 'select', 
      opciones: [
      ]
    },
    { nombre: 'codigo', label: 'Código', tipo: 'text' },
    { 
      nombre: 'tipo_acero', 
      label: 'Tipo de Acero', 
      tipo: 'select', 
      opciones: [
      ]
    },
    { nombre: 'descripcion', label: 'Descripción', tipo: 'text' },
    { nombre: 'precio', label: 'Precio', tipo: 'number' },
    { 
      nombre: 'rendimiento', 
      label: 'Rendimiento', 
      tipo: 'number',
      step: '0.01',
      placeholder: 'Ej: 98.75'
    }
  ]
},
{
  nombre: 'Jefe Guardia Acero',
  icon: 'mas.svg',
  tipo: 'JefeGuardiaAcero',
  datos: [],
  campos: [
    { nombre: 'jefe_de_guardia', label: 'Nombre', tipo: 'text' },
    { 
      nombre: 'turno', 
      label: 'Turno', 
      tipo: 'select',
      opciones: ['DIA', 'NOCHE']
    },
    { 
      nombre: 'activo', 
      label: 'Activo', 
      tipo: 'select',
      opciones: ['SI', 'NO']
    }
  ]
},
{
  nombre: 'Operador Acero',
  icon: 'mas.svg',
  tipo: 'OperadorAcero',
  datos: [],
  campos: [
    { nombre: 'operador', label: 'Nombre', tipo: 'text' },
    { 
      nombre: 'turno', 
      label: 'Turno', 
      tipo: 'select',
      opciones: ['DIA', 'NOCHE']
    },
    { 
      nombre: 'activo', 
      label: 'Activo', 
      tipo: 'select',
      opciones: ['SI', 'NO']
    }
  ]
}
    
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

    if (this.modalContenido.tipo === 'Tipo de Perforación') {
      // Convertir SI/NO a 1/0 para la actualización
      if (datosActualizados.permitido_medicion === 'SI') {
        datosActualizados.permitido_medicion = 1;
      } else if (datosActualizados.permitido_medicion === 'NO') {
        datosActualizados.permitido_medicion = 0;
      }

      this.tipoPerforacionService.updateTipoPerforacion(id, datosActualizados).subscribe({
        next: (data) => {
          // Convertir de vuelta para mostrar en la tabla
          data.permitido_medicion = data.permitido_medicion === 1 ? 'SI' : 'NO';
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
    else if (this.modalContenido.tipo === 'Equipo') {
      this.equipoService.updateEquipo(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
    else if (this.modalContenido.tipo === 'Empresa') {
      this.empresaService.updateEmpresa(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
    else if (this.modalContenido.tipo === 'Acero') {
      this.ProcesoAceroService.updateProceso(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
    else if (this.modalContenido.tipo === 'JefeGuardiaAcero') {
      // Convertir SI/NO a 1/0 para la actualización
      if (datosActualizados.activo === 'SI') {
        datosActualizados.activo = 1;
      } else if (datosActualizados.activo === 'NO') {
        datosActualizados.activo = 0;
      }

      this.jefeGuardiaAceroService.updateJefe(id, datosActualizados).subscribe({
        next: (data) => {
          // Convertir de vuelta para mostrar en la tabla
          const dataConTexto = {
            ...data,
            activo: data.activo === 1 ? 'SI' : 'NO'
          };
          this.modalContenido.datos[this.indiceEditando] = dataConTexto;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
    else if (this.modalContenido.tipo === 'OperadorAcero') {
      // Convertir SI/NO a 1/0 para la actualización
      if (datosActualizados.activo === 'SI') {
        datosActualizados.activo = 1;
      } else if (datosActualizados.activo === 'NO') {
        datosActualizados.activo = 0;
      }

      this.operadorAceroService.updateOperador(id, datosActualizados).subscribe({
        next: (data) => {
          // Convertir de vuelta para mostrar en la tabla
          const dataConTexto = {
            ...data,
            activo: data.activo === 1 ? 'SI' : 'NO'
          };
          this.modalContenido.datos[this.indiceEditando] = dataConTexto;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }else if (this.modalContenido.tipo === 'Tipo de Acero') {
      // 👇 Nuevo bloque para actualizar Tipo de Acero
      this.tipoAceroService.updateTipoAcero(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar Tipo de Acero:', err)
      });

    } else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.updateFecha(id, datosActualizados).subscribe({
        next: (data) => {
          this.modalContenido.datos[this.indiceEditando] = data;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar Fecha Plan Mensual:', err)
      });
    }

    else if (this.modalContenido.tipo === 'Toneladas') {
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
      case 'Equipo':
        this.procesarExcelEquipo(event);
        break;
      case 'Acero':
        this.procesarExcelProcesoAcero(event);
        break;
      case 'Jefe Guardia Acero':
        this.procesarExcelJefeGuardia(event);
        break;
      case 'Operador Acero':
        this.procesarExcelOperadorAcero(event);
        break;
      case 'Tipo de Acero': // 👈 nuevo caso
        this.procesarExcelTipoAcero(event);
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

procesarExcelTipoAcero(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Buscar hoja con posibles nombres
    const sheetName = this.buscarHojaExcel(workbook, ['TIPO ACERO', 'ACEROS', 'TIPO DE ACERO']);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      console.error('❌ No se encontró la hoja "TIPO ACERO" en el archivo Excel');
      return;
    }

    const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    // Solo mapear los campos válidos del modelo
    const tiposAcero = excelData.map(row => ({
      proceso: row["PROCESO"]?.trim() || '',
      tipo_acero: row["TIPO DE ACERO"]?.trim() || row["ACERO"]?.trim() || ''
    })).filter(item => item.proceso && item.tipo_acero); // Solo guardar filas válidas

    if (tiposAcero.length === 0) {
      console.warn('⚠️ No se encontraron filas válidas con columnas PROCESO y TIPO DE ACERO.');
      return;
    }

    // Cerrar modal y mostrar pantalla de carga
    this.cerrarModal();
    const dialogRef = this.mostrarPantallaCarga();

    // Guardar cada registro
    tiposAcero.forEach(nuevoRegistro => {
      this.tipoAceroService.createTipoAcero(nuevoRegistro).subscribe({
        next: (data) => {
          this.modalContenido.datos.push(data);
        },
        error: (err) => console.error('Error al guardar Tipo de Acero desde Excel:', err)
      });
    });

    // Cerrar el diálogo de carga
    this.dialog.closeAll();
  };

  reader.readAsArrayBuffer(file);
}



procesarExcelOperadorAcero(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Buscar hoja por nombre específico
    const sheetName = this.buscarHojaExcel(workbook, ['OPERADOR ACERO', 'OPERADORES', 'OPERADOR']);
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
      console.error('No se encontró la hoja "OPERADOR ACERO" en el archivo Excel');
      return;
    }

    const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const operadores = excelData.map(row => ({
      operador: row["OPERADOR"] || '',
      turno: row["TURNO"] || '', // valores esperados: "DIA" | "NOCHE"
      activo: row["ACTIVO"] === "SI" ? 1 : 0
    }));

    this.cerrarModal();
    const dialogRef = this.mostrarPantallaCarga();

    operadores.forEach(nuevoRegistro => {
      this.operadorAceroService.createOperador(nuevoRegistro).subscribe({
        next: (data) => {
          (data as any).activoTexto = data.activo === 1 ? 'SI' : 'NO';
          this.modalContenido.datos.push(data);
        }
      });
    });

    this.dialog.closeAll();
  };

  reader.readAsArrayBuffer(file);
}

procesarExcelJefeGuardia(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Buscar hoja por nombre específico
    const sheetName = this.buscarHojaExcel(workbook, ['JEFE GUARDIA', 'JEFES GUARDIA', 'JEFE DE GUARDIA', 'JEFES']);
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
      console.error('No se encontró la hoja "JEFE GUARDIA" en el archivo Excel');
      return;
    }

    const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const jefes = excelData.map(row => ({
      jefe_de_guardia: row["JEFE DE GUARDIA"] || '',
      turno: row["TURNO"] || '', // valores esperados: "DIA" | "NOCHE"
      activo: row["ACTIVO"] === "SI" ? 1 : 0
    }));

    this.cerrarModal();
    const dialogRef = this.mostrarPantallaCarga();

    jefes.forEach(nuevoRegistro => {
      this.jefeGuardiaAceroService.createJefe(nuevoRegistro).subscribe({
        next: (data) => {
          (data as any).activoTexto = data.activo === 1 ? 'SI' : 'NO';
          this.modalContenido.datos.push(data);
        }
      });
    });

    this.dialog.closeAll();
  };

  reader.readAsArrayBuffer(file);
}

procesarExcelProcesoAcero(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Buscar hoja por nombre específico
    const sheetName = this.buscarHojaExcel(workbook, ['PROCESO ACERO', 'ACERO', 'PROCESOS ACERO', 'PROCESOS']);
    const sheet = workbook.Sheets[sheetName];
    
    if (!sheet) {
      console.error('No se encontró la hoja "PROCESO ACERO" en el archivo Excel');
      return;
    }

    const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

    const procesos = excelData.map(row => ({
      codigo: row["CÓDIGO"] || row["CODIGO"] || '', // <- Nuevo campo
      proceso: row["PROCESO"] || '',
      tipo_acero: row["TIPO DE ACERO"] || '',
      descripcion: row["DESCRIPCIÓN"] || '',
      precio: row["PRECIO"] ? Number(row["PRECIO"]) : 0
    }));

    this.cerrarModal();
    const dialogRef = this.mostrarPantallaCarga();

    procesos.forEach(nuevoRegistro => {
      this.ProcesoAceroService.createProceso(nuevoRegistro).subscribe({
        next: (data) => {
          this.modalContenido.datos.push(data);
        },
        error: (err) => console.error('Error al guardar Proceso Acero:', err)
      });
    });

    this.dialog.closeAll();
  };

  reader.readAsArrayBuffer(file);
}

  
  procesarExcelEquipo(event: any) {
    const file = event.target.files[0];
  
    if (!file) {
      
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convertimos la hoja de Excel en JSON
      const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });
  
      const equipos = excelData.map(row => ({
        nombre: row["EQUIPO"] || null,
        proceso: row["PROCESO"] || null,
        codigo: row["CODIGO"] || null,
        marca: row["MARCA"] || null,
        modelo: row["MODELO"] || null,
        serie: row["SERIE"] || null,
        anioFabricacion: row["AÑO DE FABRICACIÓN"] ? Number(row["AÑO DE FABRICACIÓN"]) : null,
        fechaIngreso: this.convertirFechaExcel(row["FECHA DE INGRESO"]),
        capacidadYd3: row["CAPACIDAD (yd3)"] ? Number(row["CAPACIDAD (yd3)"]) : null,
        capacidadM3: row["CAPACIDAD (m3)"] ? Number(row["CAPACIDAD (m3)"]) : null
      }));

  
      // 🔹 Cerrar el modal antes de enviar los datos
      this.cerrarModal();
  
      // 🔹 Mostrar pantalla de carga
      const dialogRef = this.mostrarPantallaCarga();
  
      // 🔹 Enviar los datos a la API
      this.enviarEquipos(equipos)
        .then(() => {
          
          this.dialog.closeAll();
        })
        .catch((error) => {
          console.error('❌ Error al enviar datos:', error);
          this.dialog.closeAll();
        });
    };
  
    reader.readAsArrayBuffer(file);
  }
  
  convertirFechaExcel(valor: any): string | null {
    if (!valor) return null;
  
    // Si la fecha ya está en formato texto, devolverla tal cual
    if (typeof valor === "string") return valor;
  
    // Si la fecha es un número, convertirla usando XLSX
    if (typeof valor === "number") {
      const fecha = XLSX.SSF.parse_date_code(valor);
      return `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`;
    }
  
    return null;
  }
  
  enviarEquipos(equipos: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const peticiones = equipos.map(nuevoRegistro => 
        this.equipoService.createEquipo(nuevoRegistro).toPromise()
      );
  
      Promise.all(peticiones)
        .then((responses) => {
          responses.forEach(data => this.modalContenido.datos.push(data));
          
          resolve();
        })
        .catch((error) => {
          console.error('❌ Error en la carga de equipos:', error);
          reject(error);
        });
    });
  }
  
  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  
  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;
  
    if (button.tipo === 'Tipo de Perforación') {
  this.tipoPerforacionService.getTiposPerforacion().subscribe({
    next: (data) => {
      // Mapear 1 -> 'SI' y 0 -> 'NO' antes de asignar
      this.modalContenido.datos = data.map(item => ({
        ...item,
        permitido_medicion: item.permitido_medicion === 1 ? 'SI' : 'NO'
      }));
    },
    error: (err) => console.error('Error al cargar Tipo de Perforación:', err)
  });
} else if (button.tipo === 'Equipo') {
      this.equipoService.getEquipos().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          
        },
        error: (err) => console.error('Error al cargar Equipo:', err)
      });
    }else if (button.tipo === 'Empresa') {
      this.empresaService.getEmpresa().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          
        },
        error: (err) => console.error('Error al cargar Equipo:', err)
      });
    }else if (button.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.getFechas().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          
        },
        error: (err) => console.error('Error al cargar:', err)
      });
    }else if (button.tipo === 'Toneladas') {
  this.toneladasService.getToneladas().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Toneladas:', err)
  });
}else if (button.tipo === 'Acero') {
  this.tipoAceroService.getTipoAcero().subscribe({
    next: (data) => {
      // Guardamos todos los tipos de acero
      this.tiposAceroData = data;

      // Extraemos los procesos únicos para el select
      const procesosUnicos = [...new Set(data.map(item => item.proceso))];

      // Buscamos el objeto del botón 'Acero'
      const aceroBtn = this.buttonc.find(b => b.tipo === 'Acero');
      if (aceroBtn) {
        // Reemplazamos las opciones del select 'proceso'
        const campoProceso = aceroBtn.campos.find(c => c.nombre === 'proceso');
        if (campoProceso) campoProceso.opciones = procesosUnicos;

        // Dejamos vacío el select de tipo_acero (se llenará al seleccionar proceso)
        const campoTipoAcero = aceroBtn.campos.find(c => c.nombre === 'tipo_acero');
        if (campoTipoAcero) campoTipoAcero.opciones = [];
      }

      // Cargamos los registros existentes de acero
      this.ProcesoAceroService.getProcesos().subscribe({
        next: (procesos) => {
          this.modalContenido.datos = procesos;
        },
        error: (err) => console.error('Error al cargar Proceso Acero:', err)
      });
    },
    error: (err) => console.error('Error al cargar TipoAcero:', err)
  });
}
else if (button.tipo === 'OperadorAcero') {
    this.operadorAceroService.getOperadores().subscribe({
      next: (data) => {
        this.modalContenido.datos = data.map(o => ({
  ...o,
  activo: o.activo == 1 ? 'SI' : 'NO'   // <= con == permite comparar "1" y 1
}));

      }
    });
  }else if (button.tipo === 'JefeGuardiaAcero') {
    this.jefeGuardiaAceroService.getJefes().subscribe({
      next: (data) => {
        this.modalContenido.datos = data.map(j => ({
  ...j,
  activo: j.activo == 1 ? 'SI' : 'NO'   // <= con == permite comparar "1" y 1
}));

      }
    });
  }else if (button.tipo === 'Tipo de Acero') {
    // 🔹 Nuevo bloque para Tipo de Acero
    this.tipoAceroService.getTipoAcero().subscribe({
      next: (data) => {
        this.modalContenido.datos = data; // Asigna los datos directamente
      },
      error: (err) => console.error('Error al cargar Tipo de Acero:', err)
    });

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


      if (this.modalContenido.tipo === 'Tipo de Perforación') {
  if (nuevoRegistro.permitido_medicion === 'SI') {
    nuevoRegistro.permitido_medicion = 1;
  } else if (nuevoRegistro.permitido_medicion === 'NO') {
    nuevoRegistro.permitido_medicion = 0;
  }

  this.tipoPerforacionService.createTipoPerforacion(nuevoRegistro).subscribe({
    next: (data) => {
      // Mapear el campo antes de insertar en la tabla
      data.permitido_medicion = data.permitido_medicion === 1 ? 'SI' : 'NO';
      this.modalContenido.datos.push(data);
    },
    error: (err) => console.error('Error al guardar Tipo de Perforación:', err)
  });
}
 else if (this.modalContenido.tipo === 'Equipo') {
        this.equipoService.createEquipo(nuevoRegistro).subscribe({
          next: (data) => {
            this.modalContenido.datos.push(data);
            
          },
          error: (err) => console.error('Error al guardar Equipo:', err)
        });
      }else if (this.modalContenido.tipo === 'Empresa') {
        this.empresaService.createEmpresa(nuevoRegistro).subscribe({
          next: (data) => {
            this.modalContenido.datos.push(data);
            
          },
          error: (err) => console.error('Error al guardar Empresa:', err)
        });
      }else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
        this.FechasPlanMensualService.createFecha(nuevoRegistro).subscribe({
          next: (data) => {
            this.modalContenido.datos.push(data);
            
          },
          error: (err) => console.error('Error al guardar Empresa:', err)
        });
      }
      else if (this.modalContenido.tipo === 'Acero') {
      this.ProcesoAceroService.createProceso(nuevoRegistro).subscribe({
        next: (data) => {
          this.modalContenido.datos.push(data);
        }
      });
    }else if (this.modalContenido.tipo === 'JefeGuardiaAcero') {
  // convertir antes de mandar a la API
  nuevoRegistro.activo = nuevoRegistro.activo === 'SI' ? 1 : 0;

  this.jefeGuardiaAceroService.createJefe(nuevoRegistro).subscribe({
    next: (data) => {
      // hacemos una copia SOLO para mostrar
      const dataConTexto = {
        ...data,
        activo: data.activo === 1 ? 'SI' : 'NO'
      };
      this.modalContenido.datos.push(dataConTexto);
    }
  });
} else if (this.modalContenido.tipo === 'OperadorAcero') {
  nuevoRegistro.activo = nuevoRegistro.activo === 'SI' ? 1 : 0;

  this.operadorAceroService.createOperador(nuevoRegistro).subscribe({
    next: (data) => {
      const dataConTexto = {
        ...data,
        activo: data.activo === 1 ? 'SI' : 'NO'
      };
      this.modalContenido.datos.push(dataConTexto);
    }
  });
} else if (this.modalContenido.tipo === 'Tipo de Acero') {
      // 👇 Nuevo bloque para guardar Tipo de Acero
      this.tipoAceroService.createTipoAcero(nuevoRegistro).subscribe({
        next: (data) => {
          this.modalContenido.datos.push(data);
        },
        error: (err) => console.error('Error al guardar Tipo de Acero:', err)
      });

    }




      this.nuevoDato = {};
    }
  }

  eliminar(item: any): void {
    if (!item || !this.modalContenido) return;
  
    if (this.modalContenido.tipo === 'Tipo de Perforación') {
      this.tipoPerforacionService.deleteTipoPerforacion(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          
        },
        error: (err) => console.error('Error al eliminar Tipo de Perforación:', err)
      });
    } else if (this.modalContenido.tipo === 'Equipo') {
      this.equipoService.deleteEquipo(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          
        },
        error: (err) => console.error('Error al eliminar Equipo:', err)
      });
    }else if (this.modalContenido.tipo === 'Empresa') {
      this.empresaService.deleteEmpresa(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          
        },
        error: (err) => console.error('Error al eliminar accesorio:', err)
      });
    }else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.deleteFecha(item.id).subscribe({
        next: () => {
          this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
          
        },
        error: (err) => console.error('Error al eliminar accesorio:', err)
      });
    }else if (this.modalContenido.tipo === 'Toneladas') {
  this.toneladasService.deleteTonelada(item.id).subscribe({
    next: () => {
      this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
    },
    error: (err) => console.error('Error al eliminar Tonelada:', err)
  });
}else if (this.modalContenido.tipo === 'Acero') {
    this.ProcesoAceroService.deleteProceso(item.id).subscribe({
      next: () => {
        this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
      }
    });
  }else if (this.modalContenido.tipo === 'JefeGuardiaAcero') {
    this.jefeGuardiaAceroService.deleteJefe(item.id).subscribe({
      next: () => this.modalContenido.datos = this.modalContenido.datos.filter((d: any) => d.id !== item.id)
    });
  } else if (this.modalContenido.tipo === 'OperadorAcero') {
    this.operadorAceroService.deleteOperador(item.id).subscribe({
      next: () => this.modalContenido.datos = this.modalContenido.datos.filter((d: any) => d.id !== item.id)
    });
  } else if (this.modalContenido.tipo === 'Tipo de Acero') {
    // 🔹 Nuevo bloque para Tipo de Acero
    this.tipoAceroService.deleteTipoAcero(item.id).subscribe({
      next: () => {
        // Quitamos el registro eliminado del arreglo local
        this.modalContenido.datos = this.modalContenido.datos.filter((dato: any) => dato.id !== item.id);
      },
      error: (err) => console.error('Error al eliminar Tipo de Acero:', err)
    });

  } 

  }

  descargar(item: any): void {}
}