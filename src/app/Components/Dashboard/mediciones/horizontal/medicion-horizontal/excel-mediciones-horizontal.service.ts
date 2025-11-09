import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { MedicionesHorizontal } from '../../../../../models/MedicionesHorizontal';

@Injectable({
  providedIn: 'root',
})
export class ExcelMedicionesHorizontalService {
  // Exportar solo la data filtrada
  exportFiltradaToExcel(
    datosFiltrados: MedicionesHorizontal[],
    fileName: string
  ) {
    this.exportar(datosFiltrados, fileName + '_filtrado');
  }

  // Exportar toda la data completa
  exportCompletaToExcel(
    datosCompletos: MedicionesHorizontal[],
    fileName: string
  ) {
    this.exportar(datosCompletos, fileName + '_completo');
  }

  private exportar(datos: MedicionesHorizontal[], fileName: string) {
    if (!datos || datos.length === 0) return;

    // Transformar los datos a un formato plano para Excel
    const dataForExcel = datos.map((d) => ({
      ID: d.id,
      Fecha: d.fecha,
      Turno: d.turno,
      Empresa: d.empresa,
      Zona: d.zona,
      Labor: d.labor,
      Veta: d.veta,
      'Tipo Perforación': d.tipo_perforacion,
      'Kg Explosivos': d.kg_explosivos,
      'Avance Programado': d.avance_programado,
      Ancho: d.ancho,
      Alto: d.alto,
      Envío: d.envio,
      'ID Explosivo': d.id_explosivo,
      'ID Nube': d.idnube,
      'No Aplica': d.no_aplica === 1 ? 'Sí' : 'No',
      Remanente: d.remanente === 1 ? 'Sí' : 'No',
      Semana: d['semana'],
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    this.adjustColumnWidth(ws, dataForExcel);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mediciones Horizontal');

    XLSX.writeFile(
      wb,
      `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  private adjustColumnWidth(worksheet: XLSX.WorkSheet, data: any[]) {
    const columnWidths: XLSX.ColInfo[] = [];
    const headers = Object.keys(data[0]);

    headers.forEach((header) => {
      let maxWidth = header.length;
      data.forEach((row) => {
        const value = row[header];
        if (value !== undefined && value !== null) {
          const length = value.toString().length;
          if (length > maxWidth) maxWidth = length;
        }
      });
      columnWidths.push({ wch: Math.min(Math.max(maxWidth + 2, 10), 50) });
    });

    worksheet['!cols'] = columnWidths;
  }
}
