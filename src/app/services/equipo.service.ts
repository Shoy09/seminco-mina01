import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Equipo } from '../models/equipo.model';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private baseUrl = 'Equipo';
  private equiposActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getEquipos(): Observable<Equipo[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getEquipoById(id: number): Observable<Equipo> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createEquipo(equipo: Equipo): Observable<Equipo> {
    return this.apiService.postDatos(`${this.baseUrl}/`, equipo).pipe(
      tap(() => this.equiposActualizados.next(true))
    );
  }

  updateEquipo(id: number, equipo: Equipo): Observable<Equipo> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, equipo).pipe(
      tap(() => this.equiposActualizados.next(true))
    );
  }

  deleteEquipo(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.equiposActualizados.next(true))
    );
  }

  getEquiposActualizados(): Observable<boolean> {
    return this.equiposActualizados.asObservable();
  }
}
