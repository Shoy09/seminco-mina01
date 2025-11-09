import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; 
import { BehaviorSubject, Observable, tap, delay } from 'rxjs';
import { OperadorAcero } from '../models/operador-acero.model';

@Injectable({
  providedIn: 'root'
})
export class OperadorAceroService {
  private baseUrl = 'operario-acero'; // Prefijo de la ruta en Node
  private operadoresActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todos
  getOperadores(): Observable<OperadorAcero[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener por ID
  getOperadorById(id: number): Observable<OperadorAcero> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo
  createOperador(operador: OperadorAcero): Observable<OperadorAcero> {
    return this.apiService.postDatos(`${this.baseUrl}/`, operador).pipe(
      tap(() => this.operadoresActualizados.next(true)),
      delay(100)
    );
  }

  // Actualizar
  updateOperador(id: number, operador: OperadorAcero): Observable<OperadorAcero> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, operador);
  }

  // Eliminar
  deleteOperador(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cambios
  getOperadoresActualizados(): Observable<boolean> {
    return this.operadoresActualizados.asObservable();
  }
}
