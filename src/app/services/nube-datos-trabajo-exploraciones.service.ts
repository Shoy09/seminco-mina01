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

  
}