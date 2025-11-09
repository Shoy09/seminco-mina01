export interface SalidasAceros {
  id?: number;
  fecha: string;             // DATEONLY -> string
  turno: string;
  mes: string;
  proceso: string;
  equipo: string;
  codigo_equipo?: string;    // puede ser null
  operador: string;
  jefe_guardia?: string;     // puede ser null
  tipo_acero: string;
  descripcion?: string;
  cantidad: number;
  envio: boolean;
}
