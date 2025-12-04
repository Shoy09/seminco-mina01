import { Component, OnInit } from '@angular/core';
import { NubeDatosTrabajoExploraciones, NubeDespacho, NubeDevoluciones } from '../../../../models/nube-datos-trabajo-exploraciones';
import { NubeDatosTrabajoExploracionesService } from '../../../../services/nube-datos-trabajo-exploraciones.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import * as XLSX from 'xlsx-js-style';
import { ToastrService } from 'ngx-toastr';
import { ExplosivoService } from '../../../../services/explosivo.service';
import { AccesorioService } from '../../../../services/accesorio.service';
import { Accesorio } from '../../../../models/Accesorio';
import { Explosivo } from '../../../../models/Explosivo';

@Component({
  selector: 'app-explosivos-graficos',
  imports: [NgApexchartsModule, CommonModule, FormsModule],
  templateUrl: './explosivos-graficos.component.html',
  styleUrl: './explosivos-graficos.component.css'
})
export class ExplosivosGraficosComponent implements OnInit {
    datosExplosivos: NubeDatosTrabajoExploraciones[] = [];
datosExplosivosOriginal: NubeDatosTrabajoExploraciones[] = [];
datosExplosivosExport: NubeDatosTrabajoExploraciones[] = [];
    accesorios: Accesorio[] = [];
    explosivos: Explosivo[] = [];
  fechaDesde: string = '';
fechaHasta: string = '';
turnoSeleccionado: string = '';
turnos: string[] = ['DÍA', 'NOCHE'];
  constructor(private explosivosService: NubeDatosTrabajoExploracionesService, private _toastr: ToastrService, private explosivoService: ExplosivoService,
      private accesorioService: AccesorioService,) {}

  ngOnInit(): void {
    const fechaISO = this.obtenerFechaLocalISO();
    this.fechaDesde = fechaISO;
    this.fechaHasta = fechaISO;
    this.turnoSeleccionado = this.obtenerTurnoActual();
  
  this.cargarExplosivos();
  this.cargarAccesorios();

    this.obtenerDatos(this.fechaDesde, this.fechaHasta, this.turnoSeleccionado);
  }

  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // meses comienzan en 0
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();
  
    // Turno de día: 7:00 AM a 6:59 PM (07:00 - 18:59)
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    } else {
      // Turno de noche: 7:00 PM a 6:59 AM
      return 'NOCHE';
    }
  } 

  cargarExplosivos(): void {
  this.explosivoService.getExplosivos().subscribe(
    (data) => {
      this.explosivos = data;
      console.log('Explosivos cargados:', this.explosivos);
    },
    (error) => {
      console.error('Error al cargar explosivos', error);
    }
  );
}

cargarAccesorios(): void {
  this.accesorioService.getAccesorios().subscribe(
    (data) => {
      this.accesorios = data;
      console.log('Accesorios cargados:', this.accesorios);
    },
    (error) => {
      console.error('Error al cargar accesorios', error);
    }
  );
}

private calcularFechaMinaDash(fechaOriginal?: string, turno?: string): string {
  if (!fechaOriginal) return '';

  try {
    const fecha = new Date(fechaOriginal);

    if (turno?.toLowerCase() === 'noche') {
      fecha.setDate(fecha.getDate() + 1);
    }

    return fecha.toISOString().split('T')[0]; // Devuelve formato YYYY-MM-DD
  } catch (e) {
    console.warn('Error al calcular fecha mina:', e);
    return fechaOriginal;
  }
}


obtenerDatos(fechaInicio?: string, fechaFin?: string, turno?: string): void {
    const fecha_inicio = fechaInicio || this.fechaDesde;
    const fecha_fin = fechaFin || this.fechaHasta;
    const turno_filtro = turno || this.turnoSeleccionado;

    this.explosivosService.getExplosivos({
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        turno: turno_filtro, // ✅ Se envía vacío cuando es "Todos"
        limit: 1000
    }).subscribe({
        next: (data) => {
            const arrayData = Array.isArray(data)
                ? data
                : (data && Array.isArray((data as any).data) ? (data as any).data : []);

            console.log('RAW response from getExplosivos():', data);
            console.log('Normalized arrayData:', arrayData);

            // 🔹 Calcular fecha mina para cada registro
            const datosConFechaMina = arrayData.map((item: NubeDatosTrabajoExploraciones) => ({
                ...item,
                fecha_mina: this.calcularFechaMinaDash(item.fecha, item.turno)
            }));

            this.datosExplosivosOriginal = datosConFechaMina;
            this.datosExplosivosExport = datosConFechaMina.slice();
            this.datosExplosivos = datosConFechaMina.slice();

            this._toastr.success(`Datos cargados correctamente (${fecha_inicio} a ${fecha_fin})`, '✔ Éxito');
        },
        error: (err) => {
            console.error('❌ Error al obtener datos:', err);
            this._toastr.error('Error al cargar los datos', '❌ Error');
        }
    });
}

    quitarFiltros(): void {
        const fechaISO = this.obtenerFechaLocalISO();
        this.fechaDesde = fechaISO;
        this.fechaHasta = fechaISO;
        this.turnoSeleccionado = this.obtenerTurnoActual();
    
        // 🔄 Recargar datos con fecha actual
        this.obtenerDatos(this.fechaDesde, this.fechaHasta, this.turnoSeleccionado);
    }


// ✅ VERSIÓN SIMPLE: Siempre recargar desde API cuando se aplican filtros
aplicarFiltros(): void {
    console.log('Aplicando filtros y recargando desde API...', {
        fechaDesde: this.fechaDesde,
        fechaHasta: this.fechaHasta,
        turno: this.turnoSeleccionado
    });
    
    // 🔄 Siempre recargar desde API para obtener datos actualizados
    this.obtenerDatos(this.fechaDesde, this.fechaHasta, this.turnoSeleccionado);
}

// ✅ ELIMINAR aplicarFiltrosLocales() y mantener solo este
filtrarDatos(datos: NubeDatosTrabajoExploraciones[], filtros: any): NubeDatosTrabajoExploraciones[] {
    if (!Array.isArray(datos)) {
        console.warn('filtrarDatos recibió datos que no son array:', datos);
        return [];
    }

    return datos.filter(operacion => {
        const fechaOperacion = new Date(operacion.fecha_mina ?? '');
        const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
        const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

        if (fechaDesde && fechaOperacion < fechaDesde) {
            return false;
        }
        if (fechaHasta && fechaOperacion > fechaHasta) {
            return false;
        }
        if (filtros.turnoSeleccionado && operacion.turno !== filtros.turnoSeleccionado) {
            return false;
        }
        return true;
    });
}
exportarAExcelExplosivosfiltro(): void {
  const workbook = XLSX.utils.book_new();
  
  // Obtener los datos ordenados (explosivos primero ordenados A-Z, luego accesorios ordenados A-Z)
  const { data: excelDataDetalle, headers: materialHeaders } = this.prepararDatosParaExcelfiltra();
  const excelDataConsumo = this.prepararDatosParaConsumofiltrados();
  
  // Crear hojas de trabajo
  const worksheetDetalle = XLSX.utils.json_to_sheet(excelDataDetalle);
  const worksheetConsumo = XLSX.utils.json_to_sheet(excelDataConsumo);
  
  // Añadir hojas al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheetConsumo, 'CONSUMO EXPLOSIVOS');
  XLSX.utils.book_append_sheet(workbook, worksheetDetalle, 'EXPLOSIVOS - DETALLE');
  
  XLSX.writeFile(workbook, 'BD_Explosivos.xlsx');
}

private esExplosivo(nombreMaterial: string): boolean {
  return this.explosivos.some(exp => exp.tipo_explosivo === nombreMaterial);
}

private esAccesorio(nombreMaterial: string): boolean {
  return this.accesorios.some(acc => acc.tipo_accesorio === nombreMaterial);
}

private ordenarMateriales(materiales: string[]): string[] {
  // Separar explosivos y accesorios
  const explosivos = materiales.filter(m => this.esExplosivo(m)).sort((a, b) => a.localeCompare(b));
  const accesorios = materiales.filter(m => this.esAccesorio(m)).sort((a, b) => a.localeCompare(b));
  
  // Concatenar: explosivos primero (ordenados A-Z), luego accesorios (ordenados A-Z)
  return [...explosivos, ...accesorios];
}

private prepararDatosParaConsumofiltrados(): any[] {
  const consumoData: any[] = [];
  const materialHeaders = new Set<string>();
  
  // Recolectar todos los nombres de materiales únicos
  this.datosExplosivos.forEach((dato) => {
    dato.despachos.forEach((despacho) => {
      despacho.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
    
    dato.devoluciones.forEach((devolucion) => {
      devolucion.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
  });

  // Ordenar materiales: explosivos A-Z primero, luego accesorios A-Z
  const materialesOrdenados = this.ordenarMateriales(Array.from(materialHeaders));

  // Procesar cada registro principal
  this.datosExplosivos.forEach((dato) => {
    const row = this.crearFilaBaseConsumo(dato, materialesOrdenados);
    
    // Procesar despachos y devoluciones para calcular consumos
    this.procesarConsumos(dato, row, new Set(materialesOrdenados));
    
    consumoData.push(row);
  });
  
  return consumoData;
}

private prepararDatosParaExcelfiltra(): { data: any[], headers: string[] } {
  const excelData: any[] = [];
  const materialHeaders = new Set<string>();
  
  // Primera pasada: recolectar todos los nombres de materiales únicos
  this.datosExplosivos.forEach((dato) => {
    dato.despachos.forEach((despacho) => {
      despacho.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
    
    dato.devoluciones.forEach((devolucion) => {
      devolucion.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
  });

  // Ordenar materiales: explosivos A-Z primero, luego accesorios A-Z
  const materialesOrdenados = this.ordenarMateriales(Array.from(materialHeaders));

  // Segunda pasada: procesar los datos
  this.datosExplosivos.forEach((dato) => {
    // Procesar despachos
    dato.despachos.forEach((despacho) => {
      const row = this.crearFilaBase(dato, materialesOrdenados);
      
      // Agregar información específica de despacho
      row['VALE'] = 'DESPACHO';
      row['OBSERVACIONES'] = despacho.observaciones || '';
      row['LONG. EXCEL (MS)'] = despacho.mili_segundo;
      row['LONG. EXCEL (LP)'] = despacho.medio_segundo;
      
      // Procesar detalles de explosivos en despacho
      despacho.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en despacho
      despacho.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
    
    // Procesar devoluciones
    dato.devoluciones.forEach((devolucion) => {
      const row = this.crearFilaBase(dato, materialesOrdenados);
      
      // Agregar información específica de devolución
      row['VALE'] = 'DEVOLUCIÓN';
      row['OBSERVACIONES'] = devolucion.observaciones || '';
      row['LONG. EXCEL (MS)'] = devolucion.mili_segundo;
      row['LONG. EXCEL (LP)'] = devolucion.medio_segundo;
      
      // Procesar detalles de explosivos en devolución
      devolucion.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en devolución
      devolucion.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
  });
  
  return { data: excelData, headers: materialesOrdenados };
}

exportarAExcelExplosivos(): void {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  

  // Preparar los datos para ambas hojas
  const { data: excelDataDetalle, headers: materialHeaders } = this.prepararDatosParaExcel();
  const excelDataConsumo = this.prepararDatosParaConsumo();
  
  // Crear hojas de trabajo
  const worksheetDetalle = XLSX.utils.json_to_sheet(excelDataDetalle);
  const worksheetConsumo = XLSX.utils.json_to_sheet(excelDataConsumo);
  
  // Añadir hojas al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheetConsumo, 'CONSUMO EXPLOSIVOS');
  XLSX.utils.book_append_sheet(workbook, worksheetDetalle, 'EXPLOSIVOS - DETALLE');
  
  // Generar el archivo Excel y descargarlo
  XLSX.writeFile(workbook, 'BD_Explosivos.xlsx');
}

private prepararDatosParaConsumo(): any[] {
  const consumoData: any[] = [];
  const materialHeaders = new Set<string>();

  const datos = Array.isArray(this.datosExplosivosExport) ? this.datosExplosivosExport : [];
  
  // Recolectar todos los nombres de materiales únicos
  datos.forEach((dato) => {
    dato.despachos.forEach((despacho) => {
      despacho.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
    dato.devoluciones.forEach((devolucion) => {
      devolucion.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
  });

  const materialesOrdenados = this.ordenarMateriales(Array.from(materialHeaders));

  datos.forEach((dato) => {
    const row = this.crearFilaBaseConsumo(dato, Array.from(materialesOrdenados));
    this.procesarConsumos(dato, row, new Set(materialesOrdenados));
    consumoData.push(row);
  });

  return consumoData;
}

private crearFilaBaseConsumo(dato: NubeDatosTrabajoExploraciones, materialHeaders: string[]): any {
  const fechaMina = this.calcularFechaMinaDash(dato.fecha, dato.turno);

  const row: any = {
    'ID': dato.id,
    'FECHA': dato.fecha,
    'Fecha_Mina': fechaMina,
    'TURNO': dato.turno,
    'SEMANA': dato.semanaSelect || dato.semanaDefault || '',
    'EMPRESA': dato.empresa || '',
    'ZONA': dato.zona,
    'TIPO DE LABOR': dato.tipo_labor,
    'LABOR': dato.labor,
    'ALA': dato.ala || '',
    'VETA': dato.veta,
    'SECCION': dato.seccion,
    'NIVEL': dato.nivel,
    'TIPO DE PERFORACIÓN': dato.tipo_perforacion,
    'N° TALADROS DISPARADOS': dato.taladro,
    'PIES POR TALADRO': dato.pies_por_taladro,
    
  };

  // Agregar columnas de materiales dinámicas inicializadas en 0
  materialHeaders.forEach(header => {
    row[header] = 0;
  });

  // Primero agregar todas las columnas MS (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`MS ${i}`] = 0;
  }

  // Luego agregar todas las columnas LP (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`LP ${i}`] = 0;
  }

  return row;
}
private procesarConsumos(dato: NubeDatosTrabajoExploraciones, row: any, materialHeaders: Set<string>) {
  // 1. Inicialización de contadores para materiales
  const despachosMateriales: {[key: string]: number} = {};
  const devolucionesMateriales: {[key: string]: number} = {};

  // 2. Inicialización de contadores para explosivos (MS/LP)
  const despachosExplosivos: {[key: string]: number} = {};
  const devolucionesExplosivos: {[key: string]: number} = {};

  // Inicializar todos los contadores en 0
  materialHeaders.forEach(header => {
    despachosMateriales[header] = 0;
    devolucionesMateriales[header] = 0;
  });

  for (let i = 1; i <= 20; i++) {
    despachosExplosivos[`MS ${i}`] = 0;
    despachosExplosivos[`LP ${i}`] = 0;
    devolucionesExplosivos[`MS ${i}`] = 0;
    devolucionesExplosivos[`LP ${i}`] = 0;
  }

  // Procesar DESPACHOS
  dato.despachos.forEach(despacho => {
    // Procesar materiales en despachos (se mantiene la suma)
    despacho.detalles.forEach(detalle => {
      const cantidad = parseFloat(detalle.cantidad) || 0;
      despachosMateriales[detalle.nombre_material] += cantidad;
    });

    // Procesar explosivos en despachos (sin suma, toma el último valor)
    despacho.detalles_explosivos.forEach(detalle => {
      const numero = detalle.numero;
      if (numero >= 1 && numero <= 20) {
        despachosExplosivos[`MS ${numero}`] = parseFloat(detalle.ms_cant1) || 0; // Asignación directa
        despachosExplosivos[`LP ${numero}`] = parseFloat(detalle.lp_cant1) || 0; // Asignación directa
      }
    });
  });

  // Procesar DEVOLUCIONES
  dato.devoluciones.forEach(devolucion => {
    // Procesar materiales en devoluciones (se mantiene la suma)
    devolucion.detalles.forEach(detalle => {
      const cantidad = parseFloat(detalle.cantidad) || 0;
      devolucionesMateriales[detalle.nombre_material] += cantidad;
    });

    // Procesar explosivos en devoluciones (sin suma, toma el último valor)
    devolucion.detalles_explosivos.forEach(detalle => {
      const numero = detalle.numero;
      if (numero >= 1 && numero <= 20) {
        devolucionesExplosivos[`MS ${numero}`] = parseFloat(detalle.ms_cant1) || 0; // Asignación directa
        devolucionesExplosivos[`LP ${numero}`] = parseFloat(detalle.lp_cant1) || 0; // Asignación directa
      }
    });
  });

  // Calcular CONSUMOS FINALES (Despachos - Devoluciones)
  
  // Para materiales (se mantiene igual)
  materialHeaders.forEach(header => {
    row[header] = despachosMateriales[header] - devolucionesMateriales[header];
  });

  // Para explosivos (MS/LP) - ahora usa los valores directos sin acumulación
  for (let i = 1; i <= 20; i++) {
    row[`MS ${i}`] = despachosExplosivos[`MS ${i}`] - devolucionesExplosivos[`MS ${i}`];
    row[`LP ${i}`] = despachosExplosivos[`LP ${i}`] - devolucionesExplosivos[`LP ${i}`];
  }

}

private prepararDatosParaExcel(): { data: any[], headers: string[] } {
  const excelData: any[] = [];
  const materialHeaders = new Set<string>();
  
  // Primera pasada: recolectar todos los nombres de materiales únicos
  this.datosExplosivosExport.forEach((dato) => {
    dato.despachos.forEach((despacho) => {
      despacho.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
    
    dato.devoluciones.forEach((devolucion) => {
      devolucion.detalles.forEach((detalle) => {
        materialHeaders.add(detalle.nombre_material);
      });
    });
  });


  const materialesOrdenados = this.ordenarMateriales(Array.from(materialHeaders));

  // Segunda pasada: procesar los datos
  this.datosExplosivosExport.forEach((dato) => {
    // Procesar despachos
    dato.despachos.forEach((despacho) => {
       const row = this.crearFilaBase(dato, materialesOrdenados);
      
      // Agregar información específica de despacho
      row['VALE'] = 'DESPACHO';
      row['OBSERVACIONES'] = despacho.observaciones || '';
      row['LONG. EXCEL (MS)'] = despacho.mili_segundo;
      row['LONG. EXCEL (LP)'] = despacho.medio_segundo;
      
      // Procesar detalles de explosivos en despacho
      despacho.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en despacho
      despacho.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
    
    // Procesar devoluciones
    dato.devoluciones.forEach((devolucion) => {
      const row = this.crearFilaBase(dato, materialesOrdenados);
      
      // Agregar información específica de devolución
      row['VALE'] = 'DEVOLUCIÓN';
      row['OBSERVACIONES'] = devolucion.observaciones || '';
      row['LONG. EXCEL (MS)'] = devolucion.mili_segundo;
      row['LONG. EXCEL (LP)'] = devolucion.medio_segundo;
      
      // Procesar detalles de explosivos en devolución
      devolucion.detalles_explosivos.forEach((detalle) => {
        const numero = detalle.numero;
        if (numero >= 1 && numero <= 20) {
          row[`MS ${numero}`] = detalle.ms_cant1;
          row[`LP ${numero}`] = detalle.lp_cant1;
        }
      });
      
      // Procesar otros materiales en devolución
      devolucion.detalles.forEach((detalle) => {
        row[detalle.nombre_material] = detalle.cantidad;
      });
      
      excelData.push(row);
    });
  });
  
  return { data: excelData, headers: materialesOrdenados };
}

private crearFilaBase(dato: NubeDatosTrabajoExploraciones, materialHeaders: string[]): any {
  // Primero creamos un objeto con todas las propiedades fijas
   const fechaMina = this.calcularFechaMinaDash(dato.fecha, dato.turno);
  const row: any = {
    'ID': dato.id,
    'FECHA': dato.fecha,
    'Fecha_Mina': fechaMina,
    'TURNO': dato.turno,
    'SEMANA': dato.semanaSelect || dato.semanaDefault || '',
    'EMPRESA': dato.empresa || '',
    'ZONA': dato.zona,
    'TIPO DE LABOR': dato.tipo_labor,
    'LABOR': dato.labor,
    'ALA': dato.ala || '',
    'VETA': dato.veta,
    'SECCION': dato.seccion,
    'NIVEL': dato.nivel,
    'TIPO DE PERFORACIÓN': dato.tipo_perforacion,
    'N° TALADROS DISPARADOS': dato.taladro,
    'PIES POR TALADRO': dato.pies_por_taladro,
  };

  // Agregamos las columnas de materiales dinámicas
  materialHeaders.forEach(header => {
    row[header] = '';
  });

  // Agregamos las nuevas columnas LONG. EXCEL (MS) y LONG. EXCEL (LP)
  row['LONG. EXCEL (MS)'] = '';
  row['LONG. EXCEL (LP)'] = '';

  // Agregamos las columnas MS en orden (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`MS ${i}`] = '';
  }

  // Agregamos las columnas LP en orden (1-20)
  for (let i = 1; i <= 20; i++) {
    row[`LP ${i}`] = '';
  }

  // Finalmente agregamos las últimas columnas
  row['VALE'] = '';
  row['OBSERVACIONES'] = '';
  row['Fecha_Mina'] = fechaMina;

  return row;
}

}
