import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TipoPerforacion } from '../models/tipo-perforacion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoPerforacionService {
  private baseUrl = 'TipoPerfpo'; // Debe coincidir con la ruta del backend
  private tiposActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los tipos de perforación
  getTiposPerforacion(): Observable<TipoPerforacion[]> {
    return this.apiService.getDatos(this.baseUrl + '/');
  }

  // Obtener un tipo de perforación por ID
  getTipoPerforacionById(id: number): Observable<TipoPerforacion> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo tipo de perforación
  createTipoPerforacion(tipo: TipoPerforacion): Observable<TipoPerforacion> {
    return this.apiService.postDatos(`${this.baseUrl}/`, tipo).pipe(
      tap(() => {
        this.tiposActualizados.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar un tipo de perforación
  updateTipoPerforacion(id: number, tipo: TipoPerforacion): Observable<TipoPerforacion> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, tipo);
  }

  // Eliminar un tipo de perforación
  deleteTipoPerforacion(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan los tipos de perforación
  getTiposPerforacionActualizados(): Observable<boolean> {
    return this.tiposActualizados.asObservable();
  }
}
