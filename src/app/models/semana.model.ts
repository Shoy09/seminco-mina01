// En tu archivo semana.model.ts
export interface Semana {
  id?: number; // opcional porque en creación no se envía
  numero_semana: number;
  anio: number;
  fecha_inicio: string; // Formato 'YYYY-MM-DD'
  fecha_fin: string;    // Formato 'YYYY-MM-DD'
  empresa_id: number;   // Ahora es obligatorio
}