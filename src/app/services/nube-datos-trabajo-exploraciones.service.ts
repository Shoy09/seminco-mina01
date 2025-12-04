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

getExplosivos(filtros?: {
    fecha_inicio?: string, 
    fecha_fin?: string, 
    turno?: string, // ✅ Agregar turno
    limit?: number, 
    page?: number
}): Observable<any> {
  let url = this.endpoints.explosivos;
  
  // Construir query string si hay filtros
  if (filtros) {
    const params = new URLSearchParams();
    
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.turno) params.append('turno', filtros.turno); // ✅ Agregar turno
    if (filtros.limit) params.append('limit', filtros.limit.toString());
    if (filtros.page) params.append('page', filtros.page.toString());
    
    url += '?' + params.toString();
  }
  
  return this.apiService.getDatos(url);
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

getExploracionesPorFecha(mes?: string, anio?: number): Observable<any> {
  const params = new URLSearchParams();

  if (mes) params.append('mes', mes.toUpperCase());
  if (anio) params.append('anio', anio.toString());

  const url = `${this.endpoints.explosivos}/filtrar/fecha?${params.toString()}`;
  return this.apiService.getDatos(url);
}


  
}