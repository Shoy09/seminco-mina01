export interface PlanMetraje {
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
    
    // Campos numéricos
    ancho_veta?: number;
    ancho_minado_sem?: number;
    ancho_minado_mes?: number;
    burden?: number;
    espaciamiento?: number;
    longitud_perforacion?: number;
    programado?: 'Programado' | 'No Programado';
  
    // Campos dinámicos 1A - 28B
    [key: string]: number | string | undefined;
  }
  