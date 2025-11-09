import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { FechasPlanMensual } from '../models/fechas-plan-mensual.model';

@Injectable({
  providedIn: 'root'
})
export class FechasPlanMensualService {
  private baseUrl = 'fechas-plan-mensual'; // Ruta del backend
  private fechasActualizadas = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todas las fechas del plan mensual
  getFechas(): Observable<FechasPlanMensual[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getUltimaFecha(): Observable<FechasPlanMensual> {
    return this.apiService.getDatos(`${this.baseUrl}/ultima`); // Nueva ruta
  } 


  // Obtener una fecha específica por ID
  getFechaById(id: number): Observable<FechasPlanMensual> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva fecha
  createFecha(fecha: FechasPlanMensual): Observable<FechasPlanMensual> {
    return this.apiService.postDatos(`${this.baseUrl}/`, fecha).pipe(
      tap(() => {
        this.fechasActualizadas.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar una fecha existente
  updateFecha(id: number, fecha: FechasPlanMensual): Observable<FechasPlanMensual> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, fecha);
  }

  // Eliminar una fecha
  deleteFecha(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan las fechas
  getFechasActualizadas(): Observable<boolean> {
    return this.fechasActualizadas.asObservable();
  }
}
