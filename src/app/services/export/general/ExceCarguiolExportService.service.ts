import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NubeOperacion } from '../../../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class ExcelCarguioExportService {
  exportOperacionesToExcel(datosOperacionesExport: NubeOperacion[], fileName: string) {

    // Filtrar solo operaciones con estado "Cerrado"
  const operacionesCerradas = datosOperacionesExport.filter(op => 
    op.estado?.toLowerCase() === 'cerrado' // Case-insensitive
  );

    // Preparar datos para cada hoja
    const ejecutadoData = this.prepareEjecutadoData(operacionesCerradas);
    const estadosData = this.prepareEstadosData(operacionesCerradas);
    const checklistData = this.prepareChecklistData(operacionesCerradas);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Añadir hojas al libro
    const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
    const estadosWS = XLSX.utils.json_to_sheet(estadosData);
    const checklistWS = XLSX.utils.json_to_sheet(checklistData);

    // Ajustar el ancho de las columnas
    this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
    this.adjustColumnWidth(estadosWS, estadosData);
    this.adjustColumnWidth(checklistWS, checklistData);

    XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADOFR');
    XLSX.utils.book_append_sheet(wb, estadosWS, 'ESTADOSFR');
    XLSX.utils.book_append_sheet(wb, checklistWS, 'CHECK LISTFR');

    // Exportar el archivo
    XLSX.writeFile(wb, `${fileName}_Carguio_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

private prepareEjecutadoData(operaciones: NubeOperacion[]): any[] {
  const data: any[] = [];

  // 👉 Ahora Diesel primero, luego Electrico, luego Percusion
  const ordenPrioridad = ['Diesel', 'Electrico', 'Percusion'];

  operaciones.forEach(op => {
    const rowData: any = {
      'ID Operación': op.id,
      'Turno': op.turno,
      'Equipo': op.equipo,
      'Código': op.codigo,
      'Empresa': op.empresa,
      'Fecha': op.fecha,
      'Tipo Operación': op.tipo_operacion,
      'Estado': op.estado,
    };

    if (op.horometros && op.horometros.length > 0) {
      // 👉 Ordenar primero Diesel, Electrico, Percusion y luego los demás
      const horometrosOrdenados = [...op.horometros].sort((a, b) => {
        const idxA = ordenPrioridad.indexOf(a.nombre);
        const idxB = ordenPrioridad.indexOf(b.nombre);

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.nombre.localeCompare(b.nombre); // otros alfabéticamente
      });

      horometrosOrdenados.forEach(horometro => {
        const nombreNormalizado = horometro.nombre.replace(/\s+/g, '_');

        rowData[`Horómetro ${nombreNormalizado} - Inicial`] = horometro.inicial;
        rowData[`Horómetro ${nombreNormalizado} - Final`] = horometro.final;
        rowData[`Diferencia ${nombreNormalizado}`] = horometro.final - horometro.inicial;

        let estadoOperativo;
        if (horometro.EstaOP && !horometro.EstaINOP) {
          estadoOperativo = 'Sí';
        } else if (!horometro.EstaOP && horometro.EstaINOP) {
          estadoOperativo = 'No';
        } else {
          estadoOperativo = 'Sin definir';
        }

        rowData[`Horómetro ${nombreNormalizado} - Operativo`] = estadoOperativo;
      });
    }

    const fechaMina = this.calcularFechaMina(op.fecha, op.turno);
    rowData['Fecha_Mina'] = fechaMina;
    data.push(rowData);
  });

  return data;
}

private prepareEstadosData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      const fechaMina = this.calcularFechaMina(op.fecha, op.turno);

      if (op.estados?.length) {
        op.estados.forEach(estado => {
          if (estado.carguios?.length) {
            estado.carguios.forEach(carg => {
              data.push({
                'ID Operación': op.id,
                'ID Estado': estado.id,
                'Número Estado': estado.numero,
                'Estado': estado.estado,
                'Código Estado': estado.codigo,
                'Hora Inicio': estado.hora_inicio,
                'Hora Final': estado.hora_final,
                'Carguío - Tipo Labor': carg.tipo_labor || '',
                'Carguío - Labor': carg.labor || '',
                'Carguío - Tipo Labor Manual': carg.tipo_labor_manual || '',
                'Carguío - Labor Manual': carg.labor_manual || '',
                'Carguío - Nº Cucharas': carg.ncucharas || 0,
                'Carguío - Observación': carg.observacion || '',
                'Fecha_Mina': fechaMina
              });
            });
          } else {
            data.push({
              'ID Operación': op.id,
              'ID Estado': estado.id,
              'Número Estado': estado.numero,
              'Estado': estado.estado,
              'Código Estado': estado.codigo,
              'Hora Inicio': estado.hora_inicio,
              'Hora Final': estado.hora_final,
              'Fecha_Mina': fechaMina
            });
          }
        });
      } else {
        data.push({
          'ID Operación': op.id,
          'Fecha_Mina': fechaMina,
          'Mensaje': 'No hay estados registrados para esta operación'
        });
      }
    });

    return data;
  }


private calcularFechaMina(fechaOriginal: string, turno: string): string {
  if (!fechaOriginal) return '';
  
  // Si el turno es "Noche", sumar un día a la fecha original
  if (turno?.toLowerCase() === 'noche') {
    const fecha = new Date(fechaOriginal);
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().split('T')[0];
  }
  
  // Para cualquier otro caso (incluyendo turno "Dia"), usar la fecha original
  return fechaOriginal.split('T')[0];
}

  private prepareChecklistData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];
    
    operaciones.forEach(op => {
      if (op.checklists && op.checklists.length > 0) {
        op.checklists.forEach(check => {
          data.push({
            'ID Operación': op.id,
            'Descripción': check.descripcion,
            'Decisión': check.decision === 1 ? 'Aprobado' : 'Rechazado',
            'Observación': check.observacion,
            'Categoría': check.categoria
          });
        });
      } else {
        data.push({
          'ID Operación': op.id,
          'Mensaje': 'No hay checklist registrado para esta operación'
        });
      }
    });
    
    return data;
  }

  private adjustColumnWidth(worksheet: XLSX.WorkSheet, data: any[]) {
    if (!data || data.length === 0) return;

    const columnWidths: XLSX.ColInfo[] = [];
    const headers = Object.keys(data[0]);

    headers.forEach((header, i) => {
      let maxWidth = header.length * 1.2;
      
      data.forEach(row => {
        const value = row[header];
        if (value !== undefined && value !== null) {
          const length = value.toString().length;
          if (length > maxWidth) {
            maxWidth = length * 1.1;
          }
        }
      });

      const width = Math.min(Math.max(maxWidth, 10), 50);
      columnWidths.push({ wch: width });
    });

    worksheet['!cols'] = columnWidths;
  }
}