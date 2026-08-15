import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  NubeOperacion,
  NubeHorometros,
  NubeEstado,
  NubePerforacionHorizontal,
  NubeInterPerforacionHorizontal
} from '../../models/operaciones.models';

export interface ImportResultHorizontal {
  operaciones: NubeOperacion[];
  errores: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportHorizontalService {

  /**
   * Lee un archivo Excel con las hojas EJECUTADOFR y ESTADOSFR
   * y devuelve un array de NubeOperacion con estructura completa lista para POST.
   */
  importFromExcel(file: File): Promise<ImportResultHorizontal> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const errores: string[] = [];

          // Leer hoja EJECUTADOFR
          const sheetEjecutado = workbook.Sheets['EJECUTADOFR'];
          if (!sheetEjecutado) {
            reject('El archivo no contiene la hoja EJECUTADOFR');
            return;
          }
          const rowsEjecutado: any[] = XLSX.utils.sheet_to_json(sheetEjecutado, { defval: '' });

          // Leer hoja ESTADOSFR (opcional)
          const sheetEstados = workbook.Sheets['ESTADOSFR'];
          const rowsEstados: any[] = sheetEstados
            ? XLSX.utils.sheet_to_json(sheetEstados, { defval: '' })
            : [];

          const operaciones = this.construirOperaciones(rowsEjecutado, rowsEstados, errores);

          resolve({ operaciones, errores });
        } catch (err: any) {
          reject('Error al procesar el archivo Excel: ' + err.message);
        }
      };

      reader.onerror = () => reject('Error al leer el archivo');
      reader.readAsArrayBuffer(file);
    });
  }

  private construirOperaciones(
    rowsEjecutado: any[],
    rowsEstados: any[],
    errores: string[]
  ): NubeOperacion[] {
    const mapaOperaciones = new Map<number, NubeOperacion>();
    const mapaPerforaciones = new Map<string, NubePerforacionHorizontal>();

    rowsEjecutado.forEach((row, idx) => {
      const lineaNum = idx + 2;

      const opId = Number(row['ID Operación']);
      if (!opId) {
        errores.push(`Fila ${lineaNum}: 'ID Operación' vacío o inválido, se omite.`);
        return;
      }

      // Crear NubeOperacion si no existe aún
      if (!mapaOperaciones.has(opId)) {
        const op: NubeOperacion = {
          id: opId,
          turno: row['Turno'] ?? '',
          equipo: row['Equipo'] ?? '',
          codigo: row['Código'] ?? '',
          empresa: row['Empresa'] ?? '',
          fecha: this.normalizarFecha(row['Fecha']),
          tipo_operacion: row['Tipo Operación'] ?? 'PERFORACIÓN HORIZONTAL',
          estado: row['Estado'] ?? '',
          envio: 1,
          horometros: [],
          estados: [],
          perforaciones_horizontal: []
        };

        op.horometros = this.extraerHorometros(row, opId, errores, lineaNum);

        mapaOperaciones.set(opId, op);
      }

      // Clave única para la perforación horizontal
      const clavePerf = `${opId}|${row['Perf. Horizontal - Zona']}|${row['Perf. Horizontal - Tipo Labor']}|${row['Perf. Horizontal - Labor']}|${row['Perf. Horizontal - Veta']}|${row['Perf. Horizontal - Nivel']}|${row['Perf. Horizontal - Tipo Perforación']}`;

      if (!mapaPerforaciones.has(clavePerf)) {
        const perf: NubePerforacionHorizontal = {
          id: 0,
          zona: row['Perf. Horizontal - Zona'] ?? '',
          tipo_labor: row['Perf. Horizontal - Tipo Labor'] ?? '',
          labor: row['Perf. Horizontal - Labor'] ?? '',
          ala: '',
          veta: row['Perf. Horizontal - Veta'] ?? '',
          nivel: row['Perf. Horizontal - Nivel'] ?? '',
          tipo_perforacion: row['Perf. Horizontal - Tipo Perforación'] ?? '',
          operacion_id: opId,
          inter_perforaciones_horizontal: []
        };

        mapaPerforaciones.set(clavePerf, perf);
        const op = mapaOperaciones.get(opId)!;
        op.perforaciones_horizontal = op.perforaciones_horizontal ?? [];
        op.perforaciones_horizontal.push(perf);
      }

      // Agregar inter_perforacion_horizontal
      const perf = mapaPerforaciones.get(clavePerf)!;
      const codigoActividad = row['Ejecutado - Código Actividad'];

      if (codigoActividad !== '' || row['Ejecutado - N° Taladro'] !== '') {
        const inter: NubeInterPerforacionHorizontal = {
          id: 0,
          codigo_actividad: String(codigoActividad ?? ''),
          nivel: String(row['Ejecutado - Nivel'] ?? ''),
          labor: String(row['Ejecutado - Labor'] ?? ''),
          seccion_la_labor: String(row['Ejecutado - Sección'] ?? ''),
          nbroca: Number(row['Ejecutado - N° Broca']) || 0,
          ntaladro: Number(row['Ejecutado - N° Taladro']) || 0,
          ntaladros_rimados: Number(row['Ejecutado - N° Taladros Rimados']) || 0,
          longitud_perforacion: Number(row['Ejecutado - Longitud']) || 0,
          detalles_trabajo_realizado: String(row['Ejecutado - Detalles'] ?? ''),
          perforacionhorizontal_id: 0
        };
        perf.inter_perforaciones_horizontal = perf.inter_perforaciones_horizontal ?? [];
        perf.inter_perforaciones_horizontal.push(inter);
      }
    });

    // Agregar estados desde la hoja ESTADOSFR
    rowsEstados.forEach((row) => {
      const opId = Number(row['ID Operación']);
      if (!opId || !mapaOperaciones.has(opId)) return;

      const op = mapaOperaciones.get(opId)!;
      const estado: NubeEstado = {
        id: 0,
        operacion_id: opId,
        numero: Number(row['Número Estado']) || 0,
        estado: String(row['Estado'] ?? ''),
        codigo: String(row['Código Estado'] ?? ''),
        hora_inicio: String(row['Hora Inicio'] ?? ''),
        hora_final: String(row['Hora Final'] ?? '')
      };
      op.estados = op.estados ?? [];
      op.estados.push(estado);
    });

    return Array.from(mapaOperaciones.values());
  }

  private extraerHorometros(row: any, opId: number, errores: string[], lineaNum: number): NubeHorometros[] {
    const horometros: NubeHorometros[] = [];
    const nombresYaVistos = new Set<string>();

    Object.keys(row).forEach(col => {
      const match = col.match(/^Horómetro (.+) - Inicial$/);
      if (match) {
        const nombreNorm = match[1];
        const nombre = nombreNorm.replace(/_/g, ' ');

        if (nombresYaVistos.has(nombre)) return;
        nombresYaVistos.add(nombre);

        const inicial = Number(row[`Horómetro ${nombreNorm} - Inicial`]) || 0;
        const finalVal = Number(row[`Horómetro ${nombreNorm} - Final`]) || 0;
        const operativoStr = String(row[`Horómetro ${nombreNorm} - Operativo`] ?? '');

        let estaOP = 0;
        let estaINOP = 0;
        if (operativoStr === 'Sí') { estaOP = 1; }
        else if (operativoStr === 'No') { estaINOP = 1; }

        horometros.push({
          id: 0,
          operacion_id: opId,
          nombre,
          inicial,
          final: finalVal,
          EstaOP: estaOP,
          EstaINOP: estaINOP
        });
      }
    });

    return horometros;
  }

  private normalizarFecha(valor: any): string {
    if (!valor) return '';
    if (typeof valor === 'number') {
      const fecha = XLSX.SSF.parse_date_code(valor);
      if (fecha) {
        const mes = String(fecha.m).padStart(2, '0');
        const dia = String(fecha.d).padStart(2, '0');
        return `${fecha.y}-${mes}-${dia}`;
      }
    }
    return String(valor).split('T')[0];
  }
}
