import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TipoAcero } from '../models/tipo-acero.model';

@Injectable({
  providedIn: 'root'
})
export class TipoAceroService {
  private baseUrl = 'tipo-aceros';
  private tipoAceroActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todos los tipos de acero
  getTipoAcero(): Observable<TipoAcero[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un tipo de acero por ID
  getTipoAceroById(id: number): Observable<TipoAcero> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo tipo de acero
  createTipoAcero(tipo: TipoAcero): Observable<TipoAcero> {
    return this.apiService.postDatos(`${this.baseUrl}/`, tipo).pipe(
      tap(() => this.tipoAceroActualizados.next(true))
    );
  }

  // Actualizar tipo de acero
  updateTipoAcero(id: number, tipo: TipoAcero): Observable<TipoAcero> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, tipo);
  }

  // Eliminar tipo de acero
  deleteTipoAcero(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificación de cambios
  getTipoAceroActualizados(): Observable<boolean> {
    return this.tipoAceroActualizados.asObservable();
  }
}
