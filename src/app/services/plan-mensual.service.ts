import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { PlanMensual } from '../models/plan-mensual.model';

@Injectable({
  providedIn: 'root'
})
export class PlanMensualService {
  private baseUrl = 'PlamMensual'; // Asegúrate de que coincide con tu backend
  private planesActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getPlanesMensuales(): Observable<PlanMensual[]> {
    return this.apiService.getDatos(this.baseUrl);
  } 

  getPlanMensualByYearAndMonth(anio: number, mes: string): Observable<PlanMensual[]> {
    return this.apiService.getDatos(`${this.baseUrl}/anio/${anio}/mes/${mes}`);
  }

  getPlanMensualById(id: number): Observable<PlanMensual> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createPlanMensual(planMensual: PlanMensual): Observable<PlanMensual> {
    return this.apiService.postDatos(`${this.baseUrl}/`, planMensual).pipe(
      tap(() => {
        this.planesActualizados.next(true); // Notificar que se creó un nuevo plan
      }),
      delay(100)
    );
  }

  updatePlanMensual(id: number, planMensual: PlanMensual): Observable<PlanMensual> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, planMensual).pipe(
      tap(() => {
        this.planesActualizados.next(true); // Notifica que hubo una actualización
      })
    );
  } 
  
  

  deletePlanMensual(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  getPlanMensualActualizado(): Observable<boolean> {
    return this.planesActualizados.asObservable();
  }
}
