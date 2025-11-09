export interface IngresoAceros {
  id?: number;              // opcional porque al crear no siempre lo envías
  fecha: string;            // DATEONLY -> string (formato YYYY-MM-DD)
  turno: string;
  mes: string;
  proceso: string;
  tipo_acero: string;
  descripcion?: string;     // puede ser null
  cantidad: number;
  envio: boolean;
}
