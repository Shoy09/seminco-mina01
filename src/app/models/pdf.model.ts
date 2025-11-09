// src/app/models/pdf.model.ts
export interface Pdf {
  id?: number;           // Opcional para cuando creas uno nuevo
  proceso: string;
  mes: 'ENERO' | 'FEBRERO' | 'MARZO' | 'ABRIL' | 'MAYO' | 'JUNIO' |
       'JULIO' | 'AGOSTO' | 'SEPTIEMBRE' | 'OCTUBRE' | 'NOVIEMBRE' | 'DICIEMBRE';
  url_pdf: string;
  tipo_labor?: string;   // Nuevo campo (opcional)
  labor?: string;       // Nuevo campo (opcional)
  ala?: string;         // Nuevo campo (opcional)
  createdAt?: string;    // Opcionales si vienen del backend
  updatedAt?: string;
}