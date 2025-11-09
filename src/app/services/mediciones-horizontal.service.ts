import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MedicionesHorizontal } from '../models/MedicionesHorizontal';

@Injectable({
  providedIn: 'root'
})
export class MedicionesHorizontalService {
  private baseUrl = 'medicion-tal-horizontal';
  private medicionesActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todas las mediciones horizontales
  getMediciones(): Observable<MedicionesHorizontal[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener mediciones con remanente
  getMedicionesConRemanente(): Observable<MedicionesHorizontal[]> {
    return this.apiService.getDatos(`${this.baseUrl}/remanente`);
  }

  // Obtener una medición por ID
  getMedicionById(id: number): Observable<MedicionesHorizontal> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nueva medición
  createMedicion(medicion: MedicionesHorizontal): Observable<MedicionesHorizontal> {
    return this.apiService.postDatos(`${this.baseUrl}/`, medicion).pipe(
      tap(() => this.medicionesActualizadas.next(true))
    );
  }

  // Actualizar varias mediciones (bulk update)
  bulkUpdateMediciones(mediciones: MedicionesHorizontal[]): Observable<MedicionesHorizontal[]> {
    return this.apiService.putDatos(`${this.baseUrl}/update`, mediciones).pipe(
      tap(() => this.medicionesActualizadas.next(true))
    );
  }

  // Eliminar una medición por ID
  deleteMedicion(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.medicionesActualizadas.next(true))
    );
  }

  // Observable para saber si hubo cambios
  getMedicionesActualizadas(): Observable<boolean> {
    return this.medicionesActualizadas.asObservable();
  }
}
