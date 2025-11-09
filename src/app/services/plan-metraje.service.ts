import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { PlanMetraje } from '../models/plan_metraje.model';
 
@Injectable({
  providedIn: 'root'
})
export class PlanMetrajeService {
  private baseUrl = 'PlanMetraje'; // Asegúrate de que coincide con tu backend
  private planesActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getPlanesMetrajes(): Observable<PlanMetraje[]> {
    return this.apiService.getDatos(this.baseUrl); // Llamamos al endpoint para obtener todos los planes
  }
 
    getPlanMensualByYearAndMonth(anio: number, mes: string): Observable<PlanMetraje[]> {
      return this.apiService.getDatos(`${this.baseUrl}/anio/${anio}/mes/${mes}`);
    }

  getPlanMetrajeById(id: number): Observable<PlanMetraje> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`); // Llamamos al endpoint para obtener un plan específico
  }

  createPlanMetraje(planMetraje: PlanMetraje): Observable<PlanMetraje> {
    return this.apiService.postDatos(`${this.baseUrl}/`, planMetraje).pipe(
      tap(() => {
        this.planesActualizados.next(true); // Notificar que se creó un nuevo plan
      }),
      delay(100) 
    );
  }

  updatePlanMetraje(id: number, planMensual: PlanMetraje): Observable<PlanMetraje> {
      return this.apiService.putDatos(`${this.baseUrl}/${id}`, planMensual).pipe(
        tap(() => {
          this.planesActualizados.next(true); // Notifica que hubo una actualización
        })
      );
    } 

  deletePlanMetraje(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`); // Llamamos al endpoint para eliminar un plan
  }

  getPlanMetrajeActualizado(): Observable<boolean> {
    return this.planesActualizados.asObservable(); // Obtenemos el estado de actualización del plan
  }
}