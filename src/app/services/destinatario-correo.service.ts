import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DestinatarioCorreo } from '../models/destinatario-correo';

@Injectable({
  providedIn: 'root'
})
export class DestinatarioCorreoService {
  private baseUrl = 'Despacho-Destinatario';
  private destinatariosActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getDestinatarios(): Observable<DestinatarioCorreo[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getDestinatarioById(id: number): Observable<DestinatarioCorreo> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createDestinatario(destinatario: DestinatarioCorreo): Observable<DestinatarioCorreo> {
    return this.apiService.postDatos(`${this.baseUrl}/`, destinatario).pipe(
      tap(() => this.destinatariosActualizados.next(true))
    );
  }

  updateDestinatario(id: number, destinatario: DestinatarioCorreo): Observable<DestinatarioCorreo> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, destinatario);
  }

  deleteDestinatario(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  getDestinatariosActualizados(): Observable<boolean> {
    return this.destinatariosActualizados.asObservable();
  }
}
