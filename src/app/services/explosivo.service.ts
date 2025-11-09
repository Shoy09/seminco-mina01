import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Explosivo } from '../models/Explosivo';

@Injectable({
  providedIn: 'root'
})
export class ExplosivoService {
  private baseUrl = 'explosivos'; // Ruta del backend
  private explosivosActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los explosivos
  getExplosivos(): Observable<Explosivo[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un explosivo por ID
  getExplosivoById(id: number): Observable<Explosivo> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo explosivo
  createExplosivo(explosivo: Explosivo): Observable<Explosivo> {
    return this.apiService.postDatos(`${this.baseUrl}/`, explosivo).pipe(
      tap(() => {
        this.explosivosActualizados.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar un explosivo
  updateExplosivo(id: number, explosivo: Explosivo): Observable<Explosivo> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, explosivo);
  }

  // Eliminar un explosivo
  deleteExplosivo(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan los explosivos
  getExplosivosActualizados(): Observable<boolean> {
    return this.explosivosActualizados.asObservable();
  }
}
