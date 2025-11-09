import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; 
import { BehaviorSubject, Observable, tap, delay } from 'rxjs';
import { JefeGuardiaAcero } from '../models/jefe-guardia-acero.model';

@Injectable({
  providedIn: 'root'
})
export class JefeGuardiaAceroService {
  private baseUrl = 'jefe-guardia-acero'; // Prefijo de la ruta en Node
  private jefesActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todos
  getJefes(): Observable<JefeGuardiaAcero[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener por ID
  getJefeById(id: number): Observable<JefeGuardiaAcero> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo
  createJefe(jefe: JefeGuardiaAcero): Observable<JefeGuardiaAcero> {
    return this.apiService.postDatos(`${this.baseUrl}/`, jefe).pipe(
      tap(() => this.jefesActualizados.next(true)),
      delay(100)
    );
  }

  // Actualizar
  updateJefe(id: number, jefe: JefeGuardiaAcero): Observable<JefeGuardiaAcero> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, jefe);
  }

  // Eliminar
  deleteJefe(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cambios
  getJefesActualizados(): Observable<boolean> {
    return this.jefesActualizados.asObservable();
  }
}
