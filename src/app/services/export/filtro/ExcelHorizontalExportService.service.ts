import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NubeInterPerforacionHorizontal, NubeOperacion, NubePerforacionHorizontal } from '../../../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class ExcelHorizontalExportServiceFiltro {
  exportOperacionesToExcel(datosOperaciones: NubeOperacion[], fileName: string) {

    // Filtrar solo operaciones con estado "Cerrado"
  const operacionesCerradas = datosOperaciones.filter(op => 
    op.estado?.toLowerCase() === 'cerrado' // Case-insensitive
  );

    // Preparar datos para cada hoja
    const ejecutadoData = this.prepareEjecutadoData(operacionesCerradas);
    const estadosData = this.prepareEstadosData(operacionesCerradas);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Añadir hojas al libro
    const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
    const estadosWS = XLSX.utils.json_to_sheet(estadosData);

    // Ajustar el ancho de las columnas
    this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
    this.adjustColumnWidth(estadosWS, estadosData);

    XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADOFR');
    XLSX.utils.book_append_sheet(wb, estadosWS, 'ESTADOSFR');

    // Exportar el archivo
    XLSX.writeFile(wb, `${fileName}_Horizontal_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

private prepareEjecutadoData(operaciones: NubeOperacion[]): any[] {
  const data: any[] = [];

  // Orden de prioridad para horómetros
  const ordenPrioridad = ['Diesel', 'Electrico', 'Percusion'];

  operaciones.forEach(op => {
    // Procesar horómetros (esto se repite para cada fila)
    let horometrosData: any = {};
    if (op.horometros && op.horometros.length > 0) {
      // Ordenar primero Diesel, Electrico, Percusion y luego los demás
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

        horometrosData[`Horómetro ${nombreNormalizado} - Inicial`] = horometro.inicial;
        horometrosData[`Horómetro ${nombreNormalizado} - Final`] = horometro.final;
        horometrosData[`Diferencia ${nombreNormalizado}`] = horometro.final - horometro.inicial;

        let estadoOperativo;
        if (horometro.EstaOP && !horometro.EstaINOP) {
          estadoOperativo = 'Sí';
        } else if (!horometro.EstaOP && horometro.EstaINOP) {
          estadoOperativo = 'No';
        } else {
          estadoOperativo = 'Sin definir';
        }

        horometrosData[`Horómetro ${nombreNormalizado} - Operativo`] = estadoOperativo;
      });
    }

    // Datos base de la operación (se repiten en cada fila)
    const baseData: any = {
      'ID Operación': op.id,
      'Turno': op.turno,
      'Equipo': op.equipo,
      'Código': op.codigo,
      'Empresa': op.empresa,
      'Fecha': op.fecha,
      'Tipo Operación': op.tipo_operacion,
      'Estado': op.estado,
      ...horometrosData
    };

    // Procesar perforaciones horizontales
    if (op.perforaciones_horizontal && op.perforaciones_horizontal.length > 0) {
      op.perforaciones_horizontal.forEach((perf: NubePerforacionHorizontal) => {
        // Datos de perforación horizontal (se repiten para cada inter_perforacion)
        const perforacionData: any = {
          'Perf. Horizontal - Zona': perf.zona || '',
          'Perf. Horizontal - Tipo Labor': perf.tipo_labor || '',
          'Perf. Horizontal - Labor': perf.labor || '',
          'Perf. Horizontal - Veta': perf.veta || '',
          'Perf. Horizontal - Nivel': perf.nivel || '',
          'Perf. Horizontal - Tipo Perforación': perf.tipo_perforacion || '',
          'Perf. Horizontal - Observación': ''
        };

        // Procesar interperforaciones horizontales - UNA FILA POR CADA INTER_PERFORACION
        if (perf.inter_perforaciones_horizontal && perf.inter_perforaciones_horizontal.length > 0) {
          perf.inter_perforaciones_horizontal.forEach((inter: NubeInterPerforacionHorizontal) => {
            // Datos específicos de cada inter_perforacion
            const interPerforacionData: any = {
              'Ejecutado - Código Actividad': inter.codigo_actividad || '',
              'Ejecutado - Nivel': inter.nivel || '',
              'Ejecutado - Labor': inter.labor || '',
              'Ejecutado - Sección': inter.seccion_la_labor || '',
              'Ejecutado - N° Broca': inter.nbroca || '',
              'Ejecutado - N° Taladro': inter.ntaladro || '',
              'Ejecutado - N° Taladros Rimados': inter.ntaladros_rimados || '',
              'Ejecutado - Longitud': inter.longitud_perforacion || '',
              'Ejecutado - Detalles': inter.detalles_trabajo_realizado || ''
            };

            // Combinar todos los datos para crear una fila completa
            const rowData = {
              ...baseData,
              ...perforacionData,
              ...interPerforacionData,
              'Fecha_Mina': this.calcularFechaMina(op.fecha, op.turno)
            };

            data.push(rowData);
          });
        } else {
          // Si no hay inter_perforaciones_horizontal, crear una fila con datos básicos
          const rowData = {
            ...baseData,
            ...perforacionData,
            'Fecha_Mina': this.calcularFechaMina(op.fecha, op.turno),
            'Mensaje': 'No hay interperforaciones horizontales registradas'
          };
          data.push(rowData);
        }
      });
    } else {
      // Si no hay perforaciones horizontales, crear una fila solo con datos base
      const rowData = {
        ...baseData,
        'Fecha_Mina': this.calcularFechaMina(op.fecha, op.turno),
        'Mensaje': 'No hay perforaciones horizontales registradas'
      };
      data.push(rowData);
    }
  });

  return data;
}

  private prepareEstadosData(operaciones: NubeOperacion[]): any[] {
    const data: any[] = [];
    
    operaciones.forEach(op => {
      const fechaMina = this.calcularFechaMina(op.fecha, op.turno);
      if (op.estados?.length) {
        op.estados.forEach(estado => {
          // Datos base del estado
          const estadoBase = {
            'ID Operación': op.id,
            'ID Estado': estado.id,
            'Número Estado': estado.numero,
            'Estado': estado.estado,
            'Código Estado': estado.codigo,
            'Hora Inicio': estado.hora_inicio,
            'Hora Final': estado.hora_final,
            'Fecha_Mina': fechaMina,
          };

          data.push(estadoBase);
        });
      } else {
        data.push({
          'ID Operación': op.id,
          'Mensaje': 'No hay estados registrados para esta operación',
          'Fecha_Mina': fechaMina,
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