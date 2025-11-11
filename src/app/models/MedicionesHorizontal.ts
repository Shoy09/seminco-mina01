export interface MedicionesHorizontal {
  id?: number;               // Opcional, solo para uso local
  fecha: string;
  turno?: string | null;
  empresa?: string | null;
  zona?: string | null;
  labor?: string | null;
  veta?: string | null;
  tipo_perforacion?: string | null;
  kg_explosivos?: number | null;
  avance_programado?: number | null;
  ancho?: number | null;
  alto?: number | null;
  envio?: number;
  id_explosivo?: number | null;
  idnube?: number | null;
  no_aplica?: number;
  remanente?: number;
  semana?: string | null;    // Nuevo campo agregado
  fechaAjustada?: string;
  toneladas?: number;
}
