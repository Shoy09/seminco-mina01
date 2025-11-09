export interface JefeGuardiaAcero {
  id?: number;
  jefe_de_guardia: string;  // nombre del jefe de guardia
  turno: string;            // turno de trabajo
  activo: number;           // 1 = activo, 0 = inactivo
}
