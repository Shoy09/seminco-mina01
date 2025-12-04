import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NubeOperacion } from '../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class OperacionService {
  private readonly endpoints = {
    largo: 'operacion/largo',
    largoPlan: 'operacion/largo-plan',
    horizontal: 'operacion/horizontal',
    horizontalPlan: 'operacion/horizontal-plan',
    sostenimiento: 'operacion/sostenimiento',
    sostenimientoPlan: 'operacion/sostenimiento-plan'
  };

  constructor(private apiService: ApiService) {}

  // **Operaciones de Taladro Largo**
  getOperacionesLargo(): Observable<NubeOperacion[]> {
    return this.apiService.getDatos(this.endpoints.largo);
  }

  getOperacionesLargoPlan(mes?: string, anio?: number, limit: number = 100): Observable<NubeOperacion[]> {
    const params: string[] = [];
    if (mes) params.push(`mes=${encodeURIComponent(mes)}`);
    if (anio) params.push(`anio=${anio}`);
    if (limit) params.push(`limit=${limit}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.apiService.getDatos(this.endpoints.largoPlan + query);
  }

  // **Operaciones Horizontales**
  getOperacionesHorizontal(): Observable<NubeOperacion[]> {
    return this.apiService.getDatos(this.endpoints.horizontal);
  }

  getOperacionesHorizontalPlan(mes?: string, anio?: number, limit: number = 100): Observable<NubeOperacion[]> {
    const params: string[] = [];
    if (mes) params.push(`mes=${encodeURIComponent(mes)}`);
    if (anio) params.push(`anio=${anio}`);
    if (limit) params.push(`limit=${limit}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.apiService.getDatos(this.endpoints.horizontalPlan + query);
  }

  // **Operaciones de Sostenimiento**
  getOperacionesSostenimiento(): Observable<NubeOperacion[]> {
    return this.apiService.getDatos(this.endpoints.sostenimiento);
  }

  getOperacionesSostenimientoPlan(mes?: string, anio?: number, limit: number = 100): Observable<NubeOperacion[]> {
    const params: string[] = [];
    if (mes) params.push(`mes=${encodeURIComponent(mes)}`);
    if (anio) params.push(`anio=${anio}`);
    if (limit) params.push(`limit=${limit}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.apiService.getDatos(this.endpoints.sostenimientoPlan + query);
  }
}
