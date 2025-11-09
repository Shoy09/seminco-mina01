import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Pdf } from '../models/pdf.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private baseUrl = 'pdf-operacion'; // Base de tu API
  private pdfsActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Observable para saber cuándo refrescar la lista
  get pdfsActualizados$(): Observable<boolean> {
    return this.pdfsActualizados.asObservable();
  }

  // Obtener todos los PDFs
  getPdfs(): Observable<Pdf[]> {
    return this.apiService.getDatos(`${this.baseUrl}`);
  }

  // Obtener un PDF por ID
  getPdfById(id: number): Observable<Pdf> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo PDF
  createPdf(formData: FormData): Observable<Pdf> {
    return this.apiService.postFormData(`${this.baseUrl}`, formData).pipe(
      tap(() => this.pdfsActualizados.next(true)),
      delay(100)
    );
  }

  // Actualizar PDF existente
  updatePdf(id: number, formData: FormData): Observable<Pdf> {
    return this.apiService.putFormData(`${this.baseUrl}/${id}`, formData).pipe(
      tap(() => this.pdfsActualizados.next(true))
    );
  }

  // Eliminar PDF
  deletePdf(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.pdfsActualizados.next(true))
    );
  }
}
