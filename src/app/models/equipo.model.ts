export interface Equipo {
  id?: number;
  nombre: string | null;   // Permite valores nulos
  proceso: string | null;
  codigo: string | null;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  anioFabricacion: number | null;  // Permite null
  fechaIngreso: string | null;  // Permite null si la fecha no se proporciona
  capacidadYd3: number | null;  // Permite null si no hay capacidad en yd3
  capacidadM3: number | null;   // Permite null si no hay capacidad en m3
}
