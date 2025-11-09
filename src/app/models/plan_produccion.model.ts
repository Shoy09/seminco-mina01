export interface PlanProduccion {
    id?: number;
    anio?: number;
    mes?: string;
    semana?: string;
    mina?: string;
    zona?: string;
    area?: string;
    fase?: string;
    minado_tipo?: string;
    tipo_labor?: string;
    tipo_mineral?: string;
    estructura_veta?: string;
    nivel?: string;
    block?: string;
    labor?: string;
    ala?: string;
    
    // Campos numéricos de producción
    ancho_veta?: number;
    ancho_minado_sem?: number;
    ancho_minado_mes?: number;
    ag_gr?: number;
    porcentaje_cu?: number;
    porcentaje_pb?: number;
    porcentaje_zn?: number;
    vpt_act?: number;
    vpt_final?: number;
    cut_off_1?: number;
    cut_off_2?: number;
    programado?: 'Programado' | 'No Programado';
    
    // Campos dinámicos 1A - 28B
    [key: string]: number | string | undefined;
  }
  