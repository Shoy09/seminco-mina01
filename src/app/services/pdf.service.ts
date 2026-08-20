import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Pdf } from '../models/pdf.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private baseUrl = 'pdf-operacion';
  private pdfsActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Observable para saber cuándo refrescar la lista
  get pdfsActualizados$(): Observable<boolean> {
    return this.pdfsActualizados.asObservable();
  }

  // Obtener todos los PDFs (incluye datos de carpeta)
  getPdfs(): Observable<Pdf[]> {
    return this.apiService.getDatos(`${this.baseUrl}`);
  }

  // Obtener PDFs por carpeta
  getPdfsPorCarpeta(carpetaId: number): Observable<Pdf[]> {
    return this.apiService.getDatos(`${this.baseUrl}/carpeta/${carpetaId}`);
  }

  // Obtener un PDF por ID
  getPdfById(id: number): Observable<Pdf> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo PDF
  createPdf(formData: FormData): Observable<Pdf> {
    return this.apiService.postFormData(`${this.baseUrl}`, formData).pipe(
      tap(() => this.pdfsActualizados.next(true))
    );
  }

  // Actualizar PDF existente
  updatePdf(id: number, formData: FormData): Observable<Pdf> {
    return this.apiService.putFormData(`${this.baseUrl}/${id}`, formData).pipe(
      tap(() => this.pdfsActualizados.next(true))
    );
  }

  // Eliminar PDF (también borra de Cloudinary)
  deletePdf(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.pdfsActualizados.next(true))
    );
  }
}