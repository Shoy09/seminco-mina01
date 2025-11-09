export interface ProcesoAcero {
  id?: number;
  codigo?: string;        // te lo agrego también si lo usas en el backend
  proceso: string;
  tipo_acero: string;
  descripcion?: string;
  precio: number;
  rendimiento?: number;   // nuevo campo numérico con decimales
}
