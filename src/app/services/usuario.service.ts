import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/Usuario';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = 'usuarios/usuarios'; // Define el endpoint específico para usuarios

  constructor(private apiService: ApiService) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.apiService.getDatos(this.endpoint);
  }

  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.apiService.getDatos(`${this.endpoint}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<any> {
    return this.apiService.postDatos(this.endpoint, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.apiService.putDatos(`${this.endpoint}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.endpoint}/${id}`);
  }

  actualizarFirma(id: number, formData: FormData): Observable<any> {
    return this.apiService.putDatos(`${this.endpoint}/${id}/firma`, formData);
  }

  obtenerPerfil(): Observable<Usuario> {
    return this.apiService.getDatos('usuarios/perfil'); 
  }

actualizarOperacionesAutorizadas(id: number, operaciones: { [key: string]: boolean }): Observable<any> {
  return this.apiService.putDatos(`${this.endpoint}/${id}/operaciones`, {
    operaciones_autorizadas: operaciones
  });
}

  
}