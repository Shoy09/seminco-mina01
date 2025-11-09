// excel-acero-export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { IngresoAceros } from '../../../models/ingreso-aceros.model';
import { SalidasAceros } from '../../../models/salidas-aceros.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelAceroExportService {

  constructor() { }

  // Exportar datos completos (sin filtrar)
  exportarAExcelCompleto(ingresos: IngresoAceros[], salidas: SalidasAceros[], stockData: any[]): void {
    // Hoja de Movimientos (Ingresos y Salidas combinados)
    const movimientosData = this.prepararDatosMovimientos(ingresos, salidas);
    
    // Hoja de Stock
    const stockDataFormatted = this.prepararDatosStock(stockData);

    // Crear workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Agregar hoja de movimientos
    const wsMovimientos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(movimientosData);
    XLSX.utils.book_append_sheet(wb, wsMovimientos, 'Movimientos');

    // Agregar hoja de stock
    const wsStock: XLSX.WorkSheet = XLSX.utils.json_to_sheet(stockDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stock');

    // Generar archivo Excel
    XLSX.writeFile(wb, `Reporte_Aceros_Completo_${this.obtenerFechaActual()}.xlsx`);
  }

  // Exportar datos filtrados
  exportarAExcelFiltrado(ingresosFiltrados: IngresoAceros[], salidasFiltrados: SalidasAceros[], stockFiltrado: any[]): void {
    // Hoja de Movimientos (Ingresos y Salidas combinados)
    const movimientosData = this.prepararDatosMovimientos(ingresosFiltrados, salidasFiltrados);
    
    // Hoja de Stock
    const stockDataFormatted = this.prepararDatosStock(stockFiltrado);

    // Crear workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Agregar hoja de movimientos
    const wsMovimientos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(movimientosData);
    XLSX.utils.book_append_sheet(wb, wsMovimientos, 'Movimientos');

    // Agregar hoja de stock
    const wsStock: XLSX.WorkSheet = XLSX.utils.json_to_sheet(stockDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stock');

    // Generar archivo Excel
    XLSX.writeFile(wb, `Reporte_Aceros_Filtrado_${this.obtenerFechaActual()}.xlsx`);
  }

  // Preparar datos para hoja de Movimientos
  private prepararDatosMovimientos(ingresos: IngresoAceros[], salidas: SalidasAceros[]): any[] {
    const movimientos: any[] = [];

    // Procesar ingresos
    ingresos.forEach(ingreso => {
      movimientos.push({
        FECHA: ingreso.fecha,
        TURNO: ingreso.turno,
        MES: ingreso.mes,
        PROCESO: ingreso.proceso,
        EQUIPO: '', // Los ingresos no tienen equipo
        'CODIGO DE EQUIPO': '', // Los ingresos no tienen código de equipo
        OPERADOR: '', // Los ingresos no tienen operador
        'JEFE DE GUARDIA': '', // Los ingresos no tienen jefe de guardia
        'TIPO DE ACERO': ingreso.tipo_acero,
        DESCRIPCIÓN: ingreso.descripcion || '',
        CANTIDAD: ingreso.cantidad,
        TIPO: 'INGRESO'
      });
    });

    // Procesar salidas
    salidas.forEach(salida => {
      movimientos.push({
        FECHA: salida.fecha,
        TURNO: salida.turno,
        MES: salida.mes,
        PROCESO: salida.proceso,
        EQUIPO: salida.equipo,
        'CODIGO DE EQUIPO': salida.codigo_equipo || '',
        OPERADOR: salida.operador,
        'JEFE DE GUARDIA': salida.jefe_guardia || '',
        'TIPO DE ACERO': salida.tipo_acero,
        DESCRIPCIÓN: salida.descripcion || '',
        CANTIDAD: -salida.cantidad, // Negativo para salidas
        TIPO: 'SALIDA'
      });
    });

    return movimientos;
  }

  // Preparar datos para hoja de Stock
  private prepararDatosStock(stockData: any[]): any[] {
    const fechaActual = this.obtenerFechaActual();
    const mesActual = this.obtenerMesActual();

    return stockData.map(item => ({
      FECHA: fechaActual,
      Proceso: item.proceso,
      MES: mesActual,
      'TIPO DE ACERO': item.tipo_acero,
      DESCRIPCIÓN: item.descripcion || '',
      CANTIDAD: item.diferencia,
      TIPO: this.obtenerTipoStock(item.diferencia)
    }));
  }

  // Determinar el tipo según la diferencia
  private obtenerTipoStock(diferencia: number): string {
    if (diferencia > 0) return 'EXCEDENTE';
    if (diferencia < 0) return 'DEFICIT';
    return 'EQUILIBRADO';
  }

  // Obtener fecha actual en formato YYYY-MM-DD
  private obtenerFechaActual(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Obtener mes actual
  private obtenerMesActual(): string {
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return months[new Date().getMonth()];
  }
}