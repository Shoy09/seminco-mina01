// Operación principal
export interface NubeOperacion {
    id: number;
    turno: string;
    equipo: string;
    codigo: string;
    empresa: string;
    fecha: string;
    tipo_operacion: string;
    estado: string;
    envio: number;
    fecha_mina?: string;
    createdAt?: string;
    updatedAt?: string;
    
    // Relaciones (opcionales para cuando incluyas los datos relacionados)
    horometros?: NubeHorometros[];
    estados?: NubeEstado[];
    perforaciones?: NubePerforacionTaladroLargo[];
    perforaciones_horizontal?: NubePerforacionHorizontal[];
    sostenimientos?: NubeSostenimiento[];
  }
  
  // Horómetros
  export interface NubeHorometros {
    id: number;
    operacion_id: number;
    nombre: string;
    inicial: number;
    final: number;
    EstaOP: number;
    EstaINOP: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relación (opcional)
    operacion?: NubeOperacion;
  }
  
  // Estado
  export interface NubeEstado {
    id: number;
    operacion_id: number;
    numero: number;
    estado: string;
    codigo: string;
    hora_inicio: string;
    hora_final: string;
    createdAt?: string;
    updatedAt?: string;
    
    // Relación (opcional)
    operacion?: NubeOperacion;
  }
  
  // Perforación Taladro Largo
  export interface NubePerforacionTaladroLargo {
    id: number;
    zona: string;
    tipo_labor: string;
    labor: string;
    ala: string;
    veta: string;
    nivel: string;
    tipo_perforacion: string;
    operacion_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relaciones
    operacion?: NubeOperacion;
    inter_perforaciones?: NubeInterPerforacionTaladroLargo[];
  }
  
  // Inter Perforación Taladro Largo
  export interface NubeInterPerforacionTaladroLargo {
    id: number;
    codigo_actividad: string;
    nivel: string;
    tajo: string;
    nbroca: number;
    ntaladro: number;
    nbarras: number;
    longitud_perforacion: number;
    angulo_perforacion: number;
    nfilas_de_hasta: string;
    detalles_trabajo_realizado: string;
    perforaciontaladrolargo_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relación
    perforacion_taladro_largo?: NubePerforacionTaladroLargo;
  }
  
  // Perforación Horizontal
  export interface NubePerforacionHorizontal {
    id: number;
    zona: string;
    tipo_labor: string;
    labor: string;
    ala: string;
    veta: string;
    nivel: string;
    tipo_perforacion: string;
    operacion_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relaciones
    operacion?: NubeOperacion;
    inter_perforaciones_horizontal?: NubeInterPerforacionHorizontal[];
  }
  
  // Inter Perforación Horizontal
  export interface NubeInterPerforacionHorizontal {
    id: number;
    codigo_actividad: string;
    nivel: string;
    labor: string;
    seccion_la_labor: string;
    nbroca: number;
    ntaladro: number;
    ntaladros_rimados: number;
    longitud_perforacion: number;
    detalles_trabajo_realizado: string;
    perforacionhorizontal_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relación
    perforacion_horizontal?: NubePerforacionHorizontal;
  }
  
  // Sostenimiento
  export interface NubeSostenimiento {
    id: number;
    zona: string;
    tipo_labor: string;
    labor: string;
    ala: string;
    veta: string;
    nivel: string;
    tipo_perforacion: string;
    operacion_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relaciones
    operacion?: NubeOperacion;
    inter_sostenimientos?: NubeInterSostenimiento[];
  }
  
  // Inter Sostenimiento
  export interface NubeInterSostenimiento {
    id: number;
    codigo_actividad: string;
    nivel: string;
    labor: string;
    seccion_de_labor: string;
    nbroca: number;
    ntaladro: number;
    longitud_perforacion: number;
    malla_instalada: string;
    sostenimiento_id: number;
    createdAt?: string;
    updatedAt?: string;
    
    // Relación
    sostenimiento?: NubeSostenimiento;
  }