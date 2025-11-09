import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { IngresoAceros } from '../models/ingreso-aceros.model';
import { SalidasAceros } from '../models/salidas-aceros.model';

@Injectable({
  providedIn: 'root'
})
export class AcerosService {
  private baseUrlIngresos = 'ingresos-aceros';
  private baseUrlSalidas = 'salida-aceros';

  constructor(private apiService: ApiService) {}

  // 🔹 GET Ingresos
  getIngresos(): Observable<IngresoAceros[]> {
    return this.apiService.getDatos(`${this.baseUrlIngresos}/`);
  }

  // 🔹 GET Salidas
  getSalidas(): Observable<SalidasAceros[]> {
    return this.apiService.getDatos(`${this.baseUrlSalidas}/`);
  }
}
