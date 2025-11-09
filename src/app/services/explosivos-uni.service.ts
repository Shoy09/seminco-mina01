import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ExplosivosUni } from '../models/ExplosivosUni';

@Injectable({
  providedIn: 'root'
})
export class ExplosivosUniService {
  private baseUrl = 'Explo-uni';
  private explosivosActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getExplosivos(): Observable<ExplosivosUni[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getExplosivoById(id: number): Observable<ExplosivosUni> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createExplosivo(explosivo: ExplosivosUni): Observable<ExplosivosUni> {
    return this.apiService.postDatos(`${this.baseUrl}/`, explosivo).pipe(
      tap(() => this.explosivosActualizados.next(true))
    );
  }

  updateExplosivo(id: number, explosivo: ExplosivosUni): Observable<ExplosivosUni> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, explosivo);
  }

  deleteExplosivo(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  getExplosivosActualizados(): Observable<boolean> {
    return this.explosivosActualizados.asObservable();
  }
}
