import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NubeDatosTrabajoExploracionesService  {
  private readonly endpoints = {
    explosivos: 'NubeDatosExploraciones',

  };

  constructor(private apiService: ApiService) {}

  getExplosivos(): Observable<any> {
    return this.apiService.getDatos(this.endpoints.explosivos);
  }

   getExploracionesPorTipo(tipo_perforacion: string): Observable<any> {
  const tipoEncoded = encodeURIComponent(tipo_perforacion); 
  const url = `${this.endpoints.explosivos}/filtrar/tipo?tipo_perforacion=${tipoEncoded}`;
  return this.apiService.getDatos(url);
}

getExploracionesPorLabor(
  tipo_labor: string, 
  labor: string, 
  ala?: string, 
  mes?: string, 
  anio?: number
): Observable<any> {
  const params = new URLSearchParams();

  if (tipo_labor) params.append('tipo_labor', tipo_labor);
  if (labor) params.append('labor', labor);
  if (ala) params.append('ala', ala);
  if (mes) params.append('mes', mes.toUpperCase());
  if (anio) params.append('anio', anio.toString());

  const url = `${this.endpoints.explosivos}/filtrar/labor?${params.toString()}`;
  return this.apiService.getDatos(url);
}

  
}