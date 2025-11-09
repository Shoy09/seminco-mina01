export interface TipoPerforacion {
    id?: number;  // `id` es opcional
    nombre: string;
    proceso?: string | null;
    permitido_medicion: number | string;
}
