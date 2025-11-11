export interface NubeDetalleDespachoExplosivos {
  id: number;
  numero: number;
  ms_cant1: string;
  lp_cant1: string;
}

export interface NubeDespachoDetalle {
  id: number;
  nombre_material: string;
  cantidad: string;
}

export interface NubeDespacho {
  id: number;
  mili_segundo: number;
  medio_segundo: number;
  observaciones?: string;  // Nuevo campo
  detalles: NubeDespachoDetalle[];
  detalles_explosivos: NubeDetalleDespachoExplosivos[];
}

export interface NubeDetalleDevolucionesExplosivos {
  id: number;
  numero: number;
  ms_cant1: string;
  lp_cant1: string;
}

export interface NubeDevolucionDetalle {
  id: number;
  nombre_material: string;
  cantidad: string;
}

export interface NubeDevoluciones {
  id: number;
  mili_segundo: number;
  medio_segundo: number;
  observaciones?: string;  // Nuevo campo
  detalles: NubeDevolucionDetalle[];
  detalles_explosivos: NubeDetalleDevolucionesExplosivos[];
}

export interface NubeDatosTrabajoExploraciones {
  id: number;
  fecha: string;
  turno: string;
  taladro: string;
  pies_por_taladro: string;
  zona: string;
  tipo_labor: string;
  labor: string;
  ala?: string;           // Nuevo campo
  veta: string;
  nivel: string;
  tipo_perforacion: string;
  estado: string;
  cerrado: number;
  envio?: number;         // Nuevo campo
  semanaDefault?: string;  // Nuevo campo
  semanaSelect?: string;  // Nuevo campo
  empresa?: string;       // Nuevo campo
  seccion: string;
  fecha_mina?: string; 
  despachos: NubeDespacho[];
  devoluciones: NubeDevoluciones[];
}