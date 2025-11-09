import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { Semana } from '../models/semana.model';

@Injectable({
  providedIn: 'root'
})
export class SemanaService {
  private baseUrl = 'semana-personali/empresas'; // Base path modificado
  private semanasActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  get semanasActualizadas$(): Observable<boolean> {
    return this.semanasActualizadas.asObservable();
  }

  // Obtener todas las semanas de una empresa
  getSemanas(empresaId: number): Observable<Semana[]> {
    return this.apiService.getDatos(`${this.baseUrl}/${empresaId}/semanas`);
  }

  // Obtener una semana específica de una empresa
  getSemanaById(empresaId: number, semanaId: number): Observable<Semana> {
    return this.apiService.getDatos(`${this.baseUrl}/${empresaId}/semanas/${semanaId}`);
  }

createSemana(empresaId: number, semana: Semana): Observable<Semana> {
  // Asegurar que el empresa_id coincide
  const semanaData = {...semana, empresa_id: empresaId};
  return this.apiService.postDatos(`${this.baseUrl}/${empresaId}/semanas`, semanaData).pipe(
    tap(() => this.semanasActualizadas.next(true)),
    delay(100) // Retraso de 100ms
  );
}

  // Actualizar semana de una empresa
  updateSemana(empresaId: number, semanaId: number, semana: Semana): Observable<Semana> {
    // Asegurar que no se modifique la empresa asociada
    const {empresa_id, ...semanaData} = semana;
    return this.apiService.putDatos(
      `${this.baseUrl}/${empresaId}/semanas/${semanaId}`, 
      semanaData
    ).pipe(
      tap(() => this.semanasActualizadas.next(true))
    );
  }

  // Eliminar semana de una empresa
  deleteSemana(empresaId: number, semanaId: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${empresaId}/semanas/${semanaId}`).pipe(
      tap(() => this.semanasActualizadas.next(true))
    );
  }
}