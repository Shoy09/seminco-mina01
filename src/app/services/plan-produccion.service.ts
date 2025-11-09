import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { PlanProduccion } from '../models/plan_produccion.model'; // Asegúrate de que el nombre del archivo sea correcto

@Injectable({
  providedIn: 'root'
})
export class PlanProduccionService {
  private baseUrl = 'PlanProduccion'; // Asegúrate de que coincide con tu backend
  private planesActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getPlanesProduccion(): Observable<PlanProduccion[]> {
    return this.apiService.getDatos(this.baseUrl); // Llamamos al endpoint para obtener todos los planes de producción
  }

  getPlanMensualByYearAndMonth(anio: number, mes: string): Observable<PlanProduccion[]> {
        return this.apiService.getDatos(`${this.baseUrl}/anio/${anio}/mes/${mes}`);
      }

  getPlanProduccionById(id: number): Observable<PlanProduccion> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`); // Llamamos al endpoint para obtener un plan de producción específico
  }

createPlanProduccion(planProduccion: PlanProduccion): Observable<PlanProduccion> {
    return this.apiService.postDatos(`${this.baseUrl}/`, planProduccion).pipe(
        tap(() => {
            this.planesActualizados.next(true);
        }),
        // Añade un pequeño delay entre requests si es necesario
        delay(100) // 100ms entre requests
    );
}

    updatePlanProduccion(id: number, planMensual: PlanProduccion): Observable<PlanProduccion> {
      return this.apiService.putDatos(`${this.baseUrl}/${id}`, planMensual).pipe(
        tap(() => {
          this.planesActualizados.next(true); // Notifica que hubo una actualización
        })
      );
    } 

  deletePlanProduccion(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`); // Llamamos al endpoint para eliminar un plan de producción
  }

  getPlanProduccionActualizado(): Observable<boolean> {
    return this.planesActualizados.asObservable(); // Obtenemos el estado de actualización del plan de producción
  }
}
