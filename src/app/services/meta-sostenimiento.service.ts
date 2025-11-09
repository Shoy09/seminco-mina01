import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Meta } from '../models/meta.model';

@Injectable({
  providedIn: 'root'
})
export class MetaSostenimientoService {
  private baseUrl = 'metas-sostenimiento'; // Nombre de tu endpoint en el backend
  private metasActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todas las metas
  getMetas(): Observable<Meta[]> {
    return this.apiService.getDatos(this.baseUrl);
  }

  // Obtener una meta por ID
  getMetaById(id: number): Observable<Meta> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva meta
  createMeta(meta: Meta): Observable<Meta> {
    return this.apiService.postDatos(`${this.baseUrl}/`, meta).pipe(
      tap(() => {
        this.metasActualizadas.next(true); // Notificar que se creó una nueva meta
      })
    );
  }

  // Actualizar una meta
  updateMeta(id: number, meta: Meta): Observable<Meta> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, meta).pipe(
      tap(() => {
        this.metasActualizadas.next(true); // Notificar que se actualizó una meta
      })
    );
  }

  // Eliminar una meta
  deleteMeta(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.metasActualizadas.next(true); // Notificar que se eliminó una meta
      })
    );
  }

  // Permite suscribirse para saber si hubo cambios
  getMetaActualizada(): Observable<boolean> {
    return this.metasActualizadas.asObservable();
  }
}
