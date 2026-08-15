import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  NubeOperacion,
  NubeHorometros,
  NubeEstado,
  NubePerforacionTaladroLargo,
  NubeInterPerforacionTaladroLargo
} from '../../models/operaciones.models';

export interface ImportResultLargo {
  operaciones: NubeOperacion[];
  errores: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportLargoService {

  /**
   * Lee un archivo Excel con las hojas EJECUTADOTL y ESTADOSTL
   * y devuelve un array de NubeOperacion con estructura completa lista para POST.
   */
  importFromExcel(file: File): Promise<ImportResultLargo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const errores: string[] = [];

          // Leer hoja EJECUTADOTL
          const sheetEjecutado = workbook.Sheets['EJECUTADOTL'];
          if (!sheetEjecutado) {
            reject('El archivo no contiene la hoja EJECUTADOTL');
            return;
          }
          const rowsEjecutado: any[] = XLSX.utils.sheet_to_json(sheetEjecutado, { defval: '' });

          // Leer hoja ESTADOSTL (opcional)
          const sheetEstados = workbook.Sheets['ESTADOSTL'];
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
    // Mapa por ID de operación para reagrupar filas planas → estructura anidada
    const mapaOperaciones = new Map<number, NubeOperacion>();
    // Mapa para perforaciones: clave = operacion_id + zona + tipo_labor + labor + veta + nivel + tipo_perforacion
    const mapaPerforaciones = new Map<string, NubePerforacionTaladroLargo>();

    rowsEjecutado.forEach((row, idx) => {
      const lineaNum = idx + 2; // +2 por encabezado Excel

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
          tipo_operacion: row['Tipo Operación'] ?? 'PERFORACIÓN TALADROS LARGOS',
          estado: row['Estado'] ?? '',
          envio: 1,
          horometros: [],
          estados: [],
          perforaciones: []
        };

        // Extraer horómetros de columnas dinámicas
        op.horometros = this.extraerHorometros(row, opId, errores, lineaNum);

        mapaOperaciones.set(opId, op);
      }

      // Clave única para la perforación (una por grupo de zona/labor/etc.)
      const clavePerf = `${opId}|${row['Perf. - Zona']}|${row['Perf. - Tipo Labor']}|${row['Perf. - Labor']}|${row['Perf. - Veta']}|${row['Perf. - Nivel']}|${row['Perf. - Tipo Perforación']}`;

      if (!mapaPerforaciones.has(clavePerf)) {
        const perf: NubePerforacionTaladroLargo = {
          id: 0, // el backend asignará el ID real
          zona: row['Perf. - Zona'] ?? '',
          tipo_labor: row['Perf. - Tipo Labor'] ?? '',
          labor: row['Perf. - Labor'] ?? '',
          ala: '',
          veta: row['Perf. - Veta'] ?? '',
          nivel: row['Perf. - Nivel'] ?? '',
          tipo_perforacion: row['Perf. - Tipo Perforación'] ?? '',
          operacion_id: opId,
          inter_perforaciones: []
        };

        mapaPerforaciones.set(clavePerf, perf);
        const op = mapaOperaciones.get(opId)!;
        op.perforaciones = op.perforaciones ?? [];
        op.perforaciones.push(perf);
      }

      // Agregar inter_perforacion a la perforación correspondiente
      const perf = mapaPerforaciones.get(clavePerf)!;
      const codigoActividad = row['Ejecutado - Código Actividad'];

      // Solo agregar si hay al menos código de actividad
      if (codigoActividad !== '' || row['Ejecutado - N° Taladro'] !== '') {
        const inter: NubeInterPerforacionTaladroLargo = {
          id: 0,
          codigo_actividad: String(codigoActividad ?? ''),
          nivel: String(row['Ejecutado - Nivel'] ?? ''),
          tajo: String(row['Ejecutado - Tajo'] ?? ''),
          nbroca: Number(row['Ejecutado - N° Broca']) || 0,
          ntaladro: Number(row['Ejecutado - N° Taladro']) || 0,
          nbarras: Number(row['Ejecutado - N° Barras']) || 0,
          longitud_perforacion: Number(row['Ejecutado - Longitud']) || 0,
          angulo_perforacion: Number(row['Ejecutado - Ángulo']) || 0,
          nfilas_de_hasta: String(row['Ejecutado - N° Filas'] ?? ''),
          detalles_trabajo_realizado: String(row['Ejecutado - Detalles'] ?? ''),
          perforaciontaladrolargo_id: 0
        };
        perf.inter_perforaciones = perf.inter_perforaciones ?? [];
        perf.inter_perforaciones.push(inter);
      }
    });

    // Agregar estados desde la hoja ESTADOSTL
    rowsEstados.forEach((row, idx) => {
      const lineaNum = idx + 2;
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

  /**
   * Detecta columnas con patrón "Horómetro X - Inicial" y reconstruye los NubeHorometros.
   */
  private extraerHorometros(row: any, opId: number, errores: string[], lineaNum: number): NubeHorometros[] {
    const horometros: NubeHorometros[] = [];
    const nombresYaVistos = new Set<string>();

    Object.keys(row).forEach(col => {
      const match = col.match(/^Horómetro (.+) - Inicial$/);
      if (match) {
        const nombreNorm = match[1]; // e.g. "Diesel" o "Electrico"
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
    // Si es número (fecha serial de Excel)
    if (typeof valor === 'number') {
      const fecha = XLSX.SSF.parse_date_code(valor);
      if (fecha) {
        const mes = String(fecha.m).padStart(2, '0');
        const dia = String(fecha.d).padStart(2, '0');
        return `${fecha.y}-${mes}-${dia}`;
      }
    }
    // Si ya es string ISO o con T
    const str = String(valor).split('T')[0];
    return str;
  }
}
