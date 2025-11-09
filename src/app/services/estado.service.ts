import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Estado, Estado2 } from '../models/Estado';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl = 'estado'; // Asegúrate de que coincide con tu backend
  private estadosActualizados = new BehaviorSubject<boolean>(false);
  constructor(private apiService: ApiService) {}

  getEstados(): Observable<Estado[]> {
    return this.apiService.getDatos(this.baseUrl);
  }

  getEstadoById(id: number): Observable<Estado> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createEstado(estado: Estado): Observable<Estado> {
    return this.apiService.postDatos(`${this.baseUrl}/`, estado).pipe(
      tap(() => {
        this.estadosActualizados.next(true); // Notificar que se creó un nuevo estado
      })
    );
  }

  getEstadoActualizado(): Observable<boolean> {
    return this.estadosActualizados.asObservable();
  }

  createEstado2(estado: Estado2): Observable<Estado> {
    return this.apiService.postDatos(`${this.baseUrl}/`, estado).pipe(
      tap(() => {
        this.estadosActualizados.next(true); // Notificar que se creó un nuevo estado
      })
    );
  }

  updateEstado(id: number, estado: Estado): Observable<Estado> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, estado);
  }

  deleteEstado(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }
  
}
