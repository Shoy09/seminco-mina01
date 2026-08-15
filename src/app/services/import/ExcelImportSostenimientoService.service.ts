import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  NubeOperacion,
  NubeHorometros,
  NubeEstado,
  NubeSostenimiento,
  NubeInterSostenimiento
} from '../../models/operaciones.models';

export interface ImportResultSostenimiento {
  operaciones: NubeOperacion[];
  errores: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportSostenimientoService {

  /**
   * Lee un archivo Excel con las hojas EJECUTADOSOS y ESTADOSSOS
   * y devuelve un array de NubeOperacion con estructura completa lista para POST.
   */
  importFromExcel(file: File): Promise<ImportResultSostenimiento> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const errores: string[] = [];

          // Leer hoja EJECUTADOSOS
          const sheetEjecutado = workbook.Sheets['EJECUTADOSOS'];
          if (!sheetEjecutado) {
            reject('El archivo no contiene la hoja EJECUTADOSOS');
            return;
          }
          const rowsEjecutado: any[] = XLSX.utils.sheet_to_json(sheetEjecutado, { defval: '' });

          // Leer hoja ESTADOSSOS (opcional)
          const sheetEstados = workbook.Sheets['ESTADOSSOS'];
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
    const mapaSostenimientos = new Map<string, NubeSostenimiento>();

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
          tipo_operacion: row['Tipo Operación'] ?? 'SOSTENIMIENTO',
          estado: row['Estado'] ?? '',
          envio: 1,
          horometros: [],
          estados: [],
          sostenimientos: []
        };

        op.horometros = this.extraerHorometros(row, opId, errores, lineaNum);

        mapaOperaciones.set(opId, op);
      }

      // Clave única para el sostenimiento
      const claveSost = `${opId}|${row['Sost. - Zona']}|${row['Sost. - Tipo Labor']}|${row['Sost. - Labor']}|${row['Sost. - Veta']}|${row['Sost. - Nivel']}|${row['Sost. - Tipo Perforación']}`;

      if (!mapaSostenimientos.has(claveSost)) {
        const sost: NubeSostenimiento = {
          id: 0,
          zona: row['Sost. - Zona'] ?? '',
          tipo_labor: row['Sost. - Tipo Labor'] ?? '',
          labor: row['Sost. - Labor'] ?? '',
          ala: '',
          veta: row['Sost. - Veta'] ?? '',
          nivel: row['Sost. - Nivel'] ?? '',
          tipo_perforacion: row['Sost. - Tipo Perforación'] ?? '',
          operacion_id: opId,
          inter_sostenimientos: []
        };

        mapaSostenimientos.set(claveSost, sost);
        const op = mapaOperaciones.get(opId)!;
        op.sostenimientos = op.sostenimientos ?? [];
        op.sostenimientos.push(sost);
      }

      // Agregar inter_sostenimiento
      const sost = mapaSostenimientos.get(claveSost)!;
      const codigoActividad = row['Ejecutado - Código Actividad'];

      if (codigoActividad !== '' || row['Ejecutado - N° Taladro'] !== '') {
        const inter: NubeInterSostenimiento = {
          id: 0,
          codigo_actividad: String(codigoActividad ?? ''),
          nivel: String(row['Ejecutado - Nivel'] ?? ''),
          labor: String(row['Ejecutado - Labor'] ?? ''),
          seccion_de_labor: String(row['Ejecutado - Sección'] ?? ''),
          nbroca: Number(row['Ejecutado - N° Broca']) || 0,
          ntaladro: Number(row['Ejecutado - N° Taladro']) || 0,
          longitud_perforacion: Number(row['Ejecutado - Longitud']) || 0,
          malla_instalada: String(row['Ejecutado - Malla Instalada'] ?? ''),
          sostenimiento_id: 0
        };
        sost.inter_sostenimientos = sost.inter_sostenimientos ?? [];
        sost.inter_sostenimientos.push(inter);
      }
    });

    // Agregar estados desde la hoja ESTADOSSOS
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
