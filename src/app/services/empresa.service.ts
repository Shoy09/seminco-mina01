import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private baseUrl = 'Empresa';
  private EmpresaActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getEmpresa(): Observable<Empresa[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getEmpresaById(id: number): Observable<Empresa> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createEmpresa(equipo: Empresa): Observable<Empresa> {
    return this.apiService.postDatos(`${this.baseUrl}/`, equipo).pipe(
      tap(() => this.EmpresaActualizados.next(true))
    );
  }

  updateEmpresa(id: number, equipo: Empresa): Observable<Empresa> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, equipo);
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  getEmpresaActualizados(): Observable<boolean> {
    return this.EmpresaActualizados.asObservable();
  }
}
