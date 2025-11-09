export interface FechasPlanMensual {
    id: number;            // ID obligatorio (para editar un registro)
    mes: string;           // Mes en formato de texto
    fecha_ingreso?: number;  // Fecha de ingreso opcional (sería solo para actualizar)
}
