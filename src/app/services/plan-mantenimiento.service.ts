import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { PlanMantenimiento } from '../models/plan-mantenimiento.model';
@Injectable({
  providedIn: 'root'
})
export class PlanMantenimientoService {
  private baseUrl = 'PlanMantenimiento';
  private planesActualizados = new BehaviorSubject<boolean>(false);
  constructor(private apiService: ApiService) {}
  getPlanesMantenimiento(): Observable<PlanMantenimiento[]> {
    return this.apiService.getDatos(this.baseUrl);
  }
  getPlanMantenimientoById(id: number): Observable<PlanMantenimiento> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }
  createPlanMantenimiento(plan: PlanMantenimiento): Observable<PlanMantenimiento> {
    return this.apiService.postDatos(`${this.baseUrl}/`, plan).pipe(
      tap(() => {
        this.planesActualizados.next(true);
      }),
      delay(100)
    );
  }
  updatePlanMantenimiento(id: number, plan: PlanMantenimiento): Observable<PlanMantenimiento> {
  return this.apiService.putDatos(`${this.baseUrl}/${id}`, plan).pipe(
    tap(() => this.planesActualizados.next(true)),
    delay(100)
  );
}
  deletePlanMantenimiento(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }
  getPlanMantenimientoActualizado(): Observable<boolean> {
    return this.planesActualizados.asObservable();
  }
}
