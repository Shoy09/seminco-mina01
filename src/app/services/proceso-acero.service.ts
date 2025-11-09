import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; 
import { BehaviorSubject, Observable, tap, delay } from 'rxjs';
import { ProcesoAcero } from '../models/proceso-acero.model';

@Injectable({
  providedIn: 'root'
})
export class ProcesoAceroService {
  private baseUrl = 'tipo-acero'; // Ruta del backend
  private procesosActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todos los procesos
  getProcesos(): Observable<ProcesoAcero[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un proceso por ID
  getProcesoById(id: number): Observable<ProcesoAcero> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo proceso
  createProceso(proceso: ProcesoAcero): Observable<ProcesoAcero> {
    return this.apiService.postDatos(`${this.baseUrl}/`, proceso).pipe(
      tap(() => this.procesosActualizados.next(true)),
      delay(100)
    );
  }

  // Actualizar un proceso
  updateProceso(id: number, proceso: ProcesoAcero): Observable<ProcesoAcero> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, proceso);
  }

  // Eliminar un proceso
  deleteProceso(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cambios a otros componentes
  getProcesosActualizados(): Observable<boolean> {
    return this.procesosActualizados.asObservable();
  }
}
