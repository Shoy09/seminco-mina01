export interface PlanMensual {
    id?: number;
    anio?: number;
    mes?: string;
    minado_tipo?: string;
    empresa?: string;
    zona?: string;
    area?: string;
    tipo_mineral?: string;
    fase?: string;
    estructura_veta?: string;
    nivel?: string;
    tipo_labor?: string;
    labor?: string;
    ala?: string;
    avance_m?: number;
    ancho_m?: number;
    alto_m?: number;
    tms?: number;
    programado?: 'Programado' | 'No Programado';
    // Campos 1A - 28B
    [key: string]: number | string | undefined;
  }
  