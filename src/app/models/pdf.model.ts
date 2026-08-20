export interface Pdf {
  id: number;
  nombre: string;
  url_pdf: string;
  carpeta_id: number;
  createdAt: Date;
  updatedAt: Date;
  Carpeta?: Carpeta; // Para la relación con la carpeta
}

export interface Carpeta {
  id: number;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
  Pdfs?: Pdf[]; // Para la relación inversa
}