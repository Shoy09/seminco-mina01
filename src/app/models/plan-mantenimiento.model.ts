export interface SubPlanMantenimiento {
  id?: number;
  plan_mantenimiento_id?: number;
  sistema: string;
  frecuencia: string;
  h_parada?: number;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
  actividades: string;
  cumplimiento?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanMantenimiento {
  id?: number;
  zona: string;
  cod_equipo: string;
  equipo: string;
  subplanes?: SubPlanMantenimiento[];
  createdAt?: string;
  updatedAt?: string;
}
