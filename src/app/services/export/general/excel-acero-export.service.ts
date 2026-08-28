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
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Hoja de Ingresos
    const ingresosFormatted = this.prepararDatosIngresos(ingresos);
    const wsIngresos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ingresosFormatted);
    XLSX.utils.book_append_sheet(wb, wsIngresos, 'Ingresos');

    // Hoja de Salidas
    const salidasFormatted = this.prepararDatosSalidas(salidas);
    const wsSalidas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(salidasFormatted);
    XLSX.utils.book_append_sheet(wb, wsSalidas, 'Salidas');

    // Hoja de Stocks
    const stockDataFormatted = this.prepararDatosStock(stockData);
    const wsStock: XLSX.WorkSheet = XLSX.utils.json_to_sheet(stockDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stocks');

    // Generar archivo Excel
    XLSX.writeFile(wb, `Reporte_Aceros_Completo_${this.obtenerFechaActual()}.xlsx`);
  }

  // Exportar datos filtrados
  exportarAExcelFiltrado(ingresosFiltrados: IngresoAceros[], salidasFiltrados: SalidasAceros[], stockFiltrado: any[]): void {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Hoja de Ingresos
    const ingresosFormatted = this.prepararDatosIngresos(ingresosFiltrados);
    const wsIngresos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ingresosFormatted);
    XLSX.utils.book_append_sheet(wb, wsIngresos, 'Ingresos');

    // Hoja de Salidas
    const salidasFormatted = this.prepararDatosSalidas(salidasFiltrados);
    const wsSalidas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(salidasFormatted);
    XLSX.utils.book_append_sheet(wb, wsSalidas, 'Salidas');

    // Hoja de Stocks
    const stockDataFormatted = this.prepararDatosStock(stockFiltrado);
    const wsStock: XLSX.WorkSheet = XLSX.utils.json_to_sheet(stockDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stocks');

    // Generar archivo Excel
    XLSX.writeFile(wb, `Reporte_Aceros_Filtrado_${this.obtenerFechaActual()}.xlsx`);
  }

  // Preparar datos para hoja de Ingresos
  private prepararDatosIngresos(ingresos: IngresoAceros[]): any[] {
    return ingresos.map(ingreso => ({
      FECHA: ingreso.fecha,
      TURNO: ingreso.turno,
      MES: ingreso.mes,
      PROCESO: ingreso.proceso,
      'TIPO DE ACERO': ingreso.tipo_acero,
      DESCRIPCIÓN: ingreso.descripcion || '',
      CANTIDAD: ingreso.cantidad,
    }));
  }

  // Preparar datos para hoja de Salidas
  private prepararDatosSalidas(salidas: SalidasAceros[]): any[] {
    return salidas.map(salida => ({
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
      CANTIDAD: salida.cantidad,
    }));
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