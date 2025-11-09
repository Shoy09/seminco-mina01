import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Tonelada } from '../models/tonelada';

@Injectable({
  providedIn: 'root'
})
export class ToneladasService {
  private baseUrl = 'toneladas'; // Nombre de tu endpoint según tus rutas
  private toneladasActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todas las toneladas
  getToneladas(): Observable<Tonelada[]> {
    return this.apiService.getDatos(this.baseUrl);
  }

  // Obtener una tonelada por ID
  getToneladaById(id: number): Observable<Tonelada> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva tonelada
  createToneladasMasivo(toneladas: Tonelada[]): Observable<Tonelada[]> {
  return this.apiService.postDatos(`${this.baseUrl}/`, toneladas).pipe(
    tap(() => this.toneladasActualizadas.next(true))
  );
}


  // Actualizar una tonelada
  updateTonelada(id: number, tonelada: Tonelada): Observable<Tonelada> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, tonelada).pipe(
      tap(() => {
        this.toneladasActualizadas.next(true);
      })
    );
  }

  // Eliminar una tonelada
  deleteTonelada(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.toneladasActualizadas.next(true);
      })
    );
  }

  // Permite suscribirse para saber si hubo cambios
  getToneladasActualizadas(): Observable<boolean> {
    return this.toneladasActualizadas.asObservable();
  }
}
