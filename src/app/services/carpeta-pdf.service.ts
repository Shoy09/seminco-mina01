import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Carpeta } from '../models/pdf.model';

@Injectable({
  providedIn: 'root'
})
export class CarpetaService {
  private baseUrl = 'carpetas';
  private carpetasActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Observable para saber cuándo refrescar la lista
  get carpetasActualizados$(): Observable<boolean> {
    return this.carpetasActualizados.asObservable();
  }

  // Obtener todas las carpetas
  getCarpetas(): Observable<Carpeta[]> {
    return this.apiService.getDatos(`${this.baseUrl}`);
  }

  // Obtener una carpeta por ID
  getCarpetaById(id: number): Observable<Carpeta> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nueva carpeta
  createCarpeta(nombre: string): Observable<Carpeta> {
    return this.apiService.postDatos(`${this.baseUrl}`, { nombre }).pipe(
      tap(() => this.carpetasActualizados.next(true))
    );
  }

  // Actualizar carpeta
  updateCarpeta(id: number, nombre: string): Observable<Carpeta> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, { nombre }).pipe(
      tap(() => this.carpetasActualizados.next(true))
    );
  }

  // Eliminar carpeta
  deleteCarpeta(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.carpetasActualizados.next(true))
    );
  }
}