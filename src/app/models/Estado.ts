export interface Estado {
  id: number;
  estado_principal: string;
  codigo: string;
  tipo_estado: string;
  categoria: string;
  proceso: string; // Nuevo campo agregado
}

export interface Estado2 {
  estado_principal: string;
  codigo: string;
  tipo_estado: string;
  categoria: string;
  proceso: string; // Nuevo campo agregado
}
