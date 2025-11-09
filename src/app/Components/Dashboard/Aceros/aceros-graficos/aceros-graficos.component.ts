import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IngresoAceros } from '../../../../models/ingreso-aceros.model';
import { SalidasAceros } from '../../../../models/salidas-aceros.model';
import { AcerosService } from '../../../../services/aceros.service';
import { ExcelAceroExportService } from '../../../../services/export/general/excel-acero-export.service';

// Interface para el resumen de diferencias
export interface DiferenciaAceros {
  proceso: string;
  tipo_acero: string;
  descripcion: string;
  cantidadIngresos: number;
  cantidadSalidas: number;
  diferencia: number;
  desglosado: boolean;
  ingresos: IngresoAceros[];
  salidas: SalidasAceros[];
  ultimoIngreso?: IngresoAceros;
  ultimaSalida?: SalidasAceros;
}

@Component({
  selector: 'app-aceros-graficos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aceros-graficos.component.html',
  styleUrls: ['./aceros-graficos.component.css']
})
export class AcerosGraficosComponent implements OnInit {

  // 🔹 INGRESOS
  ingresos: IngresoAceros[] = [];
  ingresosOriginal: IngresoAceros[] = [];
  ingresosOriginalExport: IngresoAceros[] = [];
  itemSeleccionado: any = null;
  
  // 🔹 SALIDAS
  salidas: SalidasAceros[] = [];
  salidasOriginal: SalidasAceros[] = [];
  salidasOriginalExport: SalidasAceros[] = [];

  // 🔹 DIFERENCIAS
  diferencias: DiferenciaAceros[] = [];

  // filtros
  fechaDesde: string = '';
  fechaHasta: string = '';
  turnoSeleccionado: string = '';
  turnos: string[] = ['DIA', 'NOCHE'];

  constructor(private acerosService: AcerosService, private excelService: ExcelAceroExportService) {}

  ngOnInit(): void {
    // Inicializar sin filtros de fecha para mostrar todos los datos
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.turnoSeleccionado = '';

    this.cargarDatos();
  }

  // ========================
  // 🔹 UTILIDADES DE FECHA
  // ========================
  obtenerFechaLocalISO(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  obtenerFechaActualFormateada(): string {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  obtenerMesActual(): string {
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    return meses[new Date().getMonth()];
  }

  obtenerTurnoActual(): string {
    const ahora = new Date();
    const hora = ahora.getHours();
    return (hora >= 7 && hora < 19) ? 'DIA' : 'NOCHE';
  }

  // ========================
  // 🔹 CARGA DE DATOS
  // ========================
  cargarDatos(): void {
    this.acerosService.getIngresos().subscribe({
      next: (ingresosData) => {
        this.ingresosOriginal = ingresosData;
        this.ingresosOriginalExport = [...ingresosData];
        this.ingresos = [...ingresosData];
        
        this.acerosService.getSalidas().subscribe({
          next: (salidasData) => {
            this.salidasOriginal = salidasData;
            this.salidasOriginalExport = [...salidasData];
            this.salidas = [...salidasData];
            this.calcularDiferencias();
          },
          error: (err) => console.error('Error cargando salidas', err)
        });
      },
      error: (err) => console.error('Error cargando ingresos', err)
    });
  }

  // ========================
  // 🔹 CÁLCULO DE DIFERENCIAS CON ÚLTIMAS TRANSACCIONES
  // ========================
  calcularDiferencias(): void {
    const diferenciasMap = new Map<string, DiferenciaAceros>();
    
    // Procesar ingresos
    this.ingresos.forEach(ingreso => {
      const key = `${ingreso.proceso}-${ingreso.tipo_acero}-${ingreso.descripcion || ''}`;
      
      if (!diferenciasMap.has(key)) {
        diferenciasMap.set(key, {
          proceso: ingreso.proceso,
          tipo_acero: ingreso.tipo_acero,
          descripcion: ingreso.descripcion || '',
          cantidadIngresos: 0,
          cantidadSalidas: 0,
          diferencia: 0,
          desglosado: false,
          ingresos: [],
          salidas: [],
          ultimoIngreso: undefined,
          ultimaSalida: undefined
        });
      }
      
      const diferencia = diferenciasMap.get(key)!;
      diferencia.cantidadIngresos += ingreso.cantidad;
      diferencia.ingresos.push(ingreso);
      
      // Actualizar último ingreso
      if (!diferencia.ultimoIngreso || this.compararFechas(ingreso.fecha, diferencia.ultimoIngreso.fecha) > 0) {
        diferencia.ultimoIngreso = ingreso;
      }
    });

    // Procesar salidas
    this.salidas.forEach(salida => {
      const key = `${salida.proceso}-${salida.tipo_acero}-${salida.descripcion || ''}`;
      
      if (!diferenciasMap.has(key)) {
        diferenciasMap.set(key, {
          proceso: salida.proceso,
          tipo_acero: salida.tipo_acero,
          descripcion: salida.descripcion || '',
          cantidadIngresos: 0,
          cantidadSalidas: 0,
          diferencia: 0,
          desglosado: false,
          ingresos: [],
          salidas: [],
          ultimoIngreso: undefined,
          ultimaSalida: undefined
        });
      }
      
      const diferencia = diferenciasMap.get(key)!;
      diferencia.cantidadSalidas += salida.cantidad;
      diferencia.salidas.push(salida);
      
      // Actualizar última salida
      if (!diferencia.ultimaSalida || this.compararFechas(salida.fecha, diferencia.ultimaSalida.fecha) > 0) {
        diferencia.ultimaSalida = salida;
      }
    });

    // Calcular diferencias finales
    diferenciasMap.forEach(diferencia => {
      diferencia.diferencia = diferencia.cantidadIngresos - diferencia.cantidadSalidas;
    });

    this.diferencias = Array.from(diferenciasMap.values());
  }

  // Método para comparar fechas (retorna 1 si fecha1 > fecha2, -1 si fecha1 < fecha2, 0 si iguales)
  private compararFechas(fecha1: string, fecha2: string): number {
    const date1 = new Date(fecha1);
    const date2 = new Date(fecha2);
    
    if (date1 > date2) return 1;
    if (date1 < date2) return -1;
    return 0;
  }

  // ========================
  // 🔹 TOGGLE DESGLOSE
  // ========================
  toggleDesglose(diferencia: DiferenciaAceros): void {
    diferencia.desglosado = !diferencia.desglosado;
  }

  // ========================
  // 🔹 FILTROS - CORREGIDO
  // ========================
  quitarFiltros(): void {
    // Limpiar todos los filtros
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.turnoSeleccionado = '';
    
    // Restaurar datos originales sin filtros
    this.ingresos = [...this.ingresosOriginal];
    this.salidas = [...this.salidasOriginal];
    this.calcularDiferencias();
  }

  aplicarFiltros(): void {
    const filtros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      turnoSeleccionado: this.turnoSeleccionado
    };

    // Solo aplicar filtros si hay valores seleccionados
    if (filtros.fechaDesde || filtros.fechaHasta || filtros.turnoSeleccionado) {
      this.ingresos = this.filtrarDatos(this.ingresosOriginal, filtros);
      this.salidas = this.filtrarDatos(this.salidasOriginal, filtros);
    } else {
      // Si no hay filtros, mostrar todos los datos
      this.ingresos = [...this.ingresosOriginal];
      this.salidas = [...this.salidasOriginal];
    }
    
    this.calcularDiferencias();
  }

  filtrarDatos<T extends { fecha: string; turno: string }>(
    datos: T[],
    filtros: any
  ): T[] {
    return datos.filter(item => {
      const fechaItem = new Date(item.fecha);
      
      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        // Comparar solo la fecha (sin hora)
        fechaDesde.setHours(0, 0, 0, 0);
        const fechaItemComparar = new Date(fechaItem);
        fechaItemComparar.setHours(0, 0, 0, 0);
        
        if (fechaItemComparar < fechaDesde) return false;
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        // Comparar solo la fecha (sin hora)
        fechaHasta.setHours(23, 59, 59, 999);
        const fechaItemComparar = new Date(fechaItem);
        fechaItemComparar.setHours(23, 59, 59, 999);
        
        if (fechaItemComparar > fechaHasta) return false;
      }

      // Filtro por turno
      if (filtros.turnoSeleccionado && item.turno !== filtros.turnoSeleccionado) {
        return false;
      }

      return true;
    });
  }

  // ========================
  // 🔹 MÉTODOS DE EXPORTACIÓN
  // ========================

  // Método para exportar datos COMPLETOS (sin filtrar)
  exportarAExcelExplosivos(): void {
    const stockCompleto = this.calcularStockCompleto();
    
    this.excelService.exportarAExcelCompleto(
      this.ingresosOriginalExport,
      this.salidasOriginalExport,
      stockCompleto
    );
  }

  // Método para exportar datos FILTRADOS
  exportarAExcelExplosivosfiltro(): void {
    const stockFiltrado = this.calcularStockFiltrado();
    
    this.excelService.exportarAExcelFiltrado(
      this.ingresos,
      this.salidas,
      stockFiltrado
    );
  }

  // Calcular stock completo (sin filtros)
  private calcularStockCompleto(): any[] {
    const stockMap = new Map<string, any>();
    
    // Procesar ingresos completos
    this.ingresosOriginalExport.forEach(ingreso => {
      const key = `${ingreso.proceso}-${ingreso.tipo_acero}-${ingreso.descripcion || ''}`;
      
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          proceso: ingreso.proceso,
          tipo_acero: ingreso.tipo_acero,
          descripcion: ingreso.descripcion || '',
          cantidadIngresos: 0,
          cantidadSalidas: 0,
          diferencia: 0
        });
      }
      
      const stock = stockMap.get(key)!;
      stock.cantidadIngresos += ingreso.cantidad;
    });

    // Procesar salidas completas
    this.salidasOriginalExport.forEach(salida => {
      const key = `${salida.proceso}-${salida.tipo_acero}-${salida.descripcion || ''}`;
      
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          proceso: salida.proceso,
          tipo_acero: salida.tipo_acero,
          descripcion: salida.descripcion || '',
          cantidadIngresos: 0,
          cantidadSalidas: 0,
          diferencia: 0
        });
      }
      
      const stock = stockMap.get(key)!;
      stock.cantidadSalidas += salida.cantidad;
    });

    // Calcular diferencias finales
    stockMap.forEach(stock => {
      stock.diferencia = stock.cantidadIngresos - stock.cantidadSalidas;
    });

    return Array.from(stockMap.values());
  }

  // Calcular stock filtrado
  private calcularStockFiltrado(): any[] {
    return this.diferencias.map(diff => ({
      proceso: diff.proceso,
      tipo_acero: diff.tipo_acero,
      descripcion: diff.descripcion,
      cantidadIngresos: diff.cantidadIngresos,
      cantidadSalidas: diff.cantidadSalidas,
      diferencia: diff.diferencia,
      ultimoIngreso: diff.ultimoIngreso,
      ultimaSalida: diff.ultimaSalida
    }));
  }

  mostrarDetalles(item: any) {
    this.itemSeleccionado = item;
  }

  cerrarModal() {
    this.itemSeleccionado = null;
  }
}