import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor(private _toastr: ToastrService) {}

  async exportChartsToPdf(chartIds: string[], filename: string = 'Reporte_Graficos.pdf') {
    const toastRef = this._toastr.info('Generando PDF, por favor espere...', 'Cargando', {
      disableTimeOut: true,
      closeButton: true
    });

    try {
      const pdf = new jsPDF('l', 'mm', [297, 210]); // A4 horizontal
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // ====== PORTADA ======
      const logo = await this.loadImageAsBase64('expor-pdf/lo.png');
      const backgroundImage = await this.loadImageAsBase64('expor-pdf/fondo.jpg');

      if (backgroundImage) {
        pdf.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);
      }

      if (logo) {
        pdf.addImage(logo, 'PNG', 10, 10, 40, 20);
      }

      pdf.setFillColor(0, 0, 0, 0.5);
      pdf.rect(pageWidth / 2 - 70, pageHeight - 40, 140, 25, 'F');

      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('REPORTE DE INDICADORES P&V', pageWidth / 2, pageHeight - 30, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

      // ====== GRÁFICOS ======
      for (let i = 0; i < chartIds.length; i++) {
        const id = chartIds[i];
        const element = document.getElementById(id);
        if (element) {
          const canvas = await html2canvas(element, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');

          pdf.addPage();

          // Fondo blanco
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          // Marco decorativo reducido
          pdf.setDrawColor(150);
          pdf.setLineWidth(0.3);
          pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

          // 📌 Eliminado: título "Gráfico X"

          // Imagen del gráfico (más pequeña)
          const imgWidth = pageWidth - 40; // menos margen horizontal
          const imgHeight = (canvas.height * imgWidth) / canvas.width * 0.9; // un poco más bajo (90%)
          const imgY = 25;
          pdf.addImage(imgData, 'PNG', 20, imgY, imgWidth, imgHeight);

          // Observaciones
          pdf.setFontSize(10);
          pdf.setTextColor(60);
          pdf.text('Observaciones:', 15, pageHeight - 30);
          pdf.setFontSize(8);
          pdf.text('* Datos sujetos a revisión técnica. No se incluyen refugios ni desarrollos capitales.', 15, pageHeight - 23);

          // Pie de página
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          pdf.text(`Página ${pdf.getNumberOfPages()} de ${chartIds.length + 1}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        }
      }

      pdf.save(filename);

      this._toastr.clear(toastRef.toastId);
      this._toastr.success('PDF generado con éxito', 'Completado');
    } catch (error) {
      this._toastr.clear();
      this._toastr.error('Ocurrió un error al generar el PDF', 'Error');
      console.error(error);
    }
  }

  private loadImageAsBase64(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
    });
  }
}
