import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NubePerforacionHorizontal, NubePerforacionTaladroLargo, NubeSostenimiento } from '../models/operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class OperacionService {
  private readonly endpoints = {
    largo: 'operacion/largo',
    horizontal: 'operacion/horizontal',
    sostenimiento: 'operacion/sostenimiento'
  };

  constructor(private apiService: ApiService) {}

  // **Operaciones de Taladro Largo**
  getOperacionesLargo(): Observable<any> {
    return this.apiService.getDatos(this.endpoints.largo);
  }


  // **Operaciones Horizontales**
  getOperacionesHorizontal(): Observable<any> {
    return this.apiService.getDatos(this.endpoints.horizontal);
  }


  // **Operaciones de Sostenimiento**
  getOperacionesSostenimiento(): Observable<any> {
    return this.apiService.getDatos(this.endpoints.sostenimiento);
  }

}
