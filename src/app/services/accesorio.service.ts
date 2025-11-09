import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Accesorio } from '../models/Accesorio';

@Injectable({
  providedIn: 'root'
})
export class AccesorioService {
  private baseUrl = 'accesorios'; // Ruta del backend
  private accesoriosActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los accesorios
  getAccesorios(): Observable<Accesorio[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un accesorio por ID
  getAccesorioById(id: number): Observable<Accesorio> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo accesorio
  createAccesorio(accesorio: Accesorio): Observable<Accesorio> {
    return this.apiService.postDatos(`${this.baseUrl}/`, accesorio).pipe(
      tap(() => {
        this.accesoriosActualizados.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar un accesorio
  updateAccesorio(id: number, accesorio: Accesorio): Observable<Accesorio> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, accesorio);
  }

  // Eliminar un accesorio
  deleteAccesorio(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan los accesorios
  getAccesoriosActualizados(): Observable<boolean> {
    return this.accesoriosActualizados.asObservable();
  }
}
