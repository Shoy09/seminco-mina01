import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Punto {
  x: number;
  y: number;
  tipo: string;
  nombre?: string;
}

interface Labor {
  puntos: Punto[];
  tipo: string;
  nombre: string;
  color: string;
}

@Component({
  selector: 'app-autocad-minero',
  imports: [FormsModule, CommonModule],
  templateUrl: './autocad-minero.component.html',
  styleUrl: './autocad-minero.component.css'
})
export class AutocadMineroComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // Coordenadas actuales
  coordX = 0;
  coordY = 0;
  coordZ = 0;

  // Sistema de labores
  labores: Labor[] = [];
  laborActual: Labor | null = null;
  
  // Tipos de labores mineras
  tiposLabor = [
    { value: 'galeria', label: 'Galería', color: '#00ff00' },
    { value: 'chimenea', label: 'Chimenea', color: '#ff0000' },
    { value: 'rampa', label: 'Rampa', color: '#ffff00' },
    { value: 'pozo', label: 'Pozo', color: '#0000ff' },
    { value: 'tajo', label: 'Tajo', color: '#ff00ff' },
    { value: 'estacion', label: 'Estación', color: '#00ffff' }
  ];

  laborSeleccionada = 'galeria';
  nombreLabor = '';

  // Control de cámara y vista
  zoom = 1;
  offsetX = 0;
  offsetY = 0;
  isDragging = false;
  lastMousePos = { x: 0, y: 0 };

  // Grid y mediciones
  mostrarGrid = true;
  snapGrid = 5;
  mostrarCoordenadas = true;

  // Mediciones
  distanciaTotal = 0;
  pendiente = 0;

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.redibujar();
  }

  // ===== GESTIÓN DE LABORES =====
  iniciarLabor() {
    if (!this.nombreLabor.trim()) {
      alert('Ingresa un nombre para la labor');
      return;
    }

    const tipoInfo = this.tiposLabor.find(t => t.value === this.laborSeleccionada);
    this.laborActual = {
      puntos: [],
      tipo: this.laborSeleccionada,
      nombre: this.nombreLabor,
      color: tipoInfo?.color || '#ffffff'
    };
    
    this.labores.push(this.laborActual);
    this.agregarPunto();
  }

  agregarPunto() {
    if (!this.laborActual) {
      alert('Primero inicia una labor');
      return;
    }

    // Aplicar snap al grid
    const x = Math.round(this.coordX / this.snapGrid) * this.snapGrid;
    const y = Math.round(this.coordY / this.snapGrid) * this.snapGrid;

    const nuevoPunto: Punto = {
      x: x,
      y: y,
      tipo: this.laborSeleccionada,
      nombre: `P${this.laborActual.puntos.length + 1}`
    };

    this.laborActual.puntos.push(nuevoPunto);
    this.calcularMediciones();
    this.redibujar();

    // Actualizar coordenadas para el siguiente punto
    this.coordX = x;
    this.coordY = y;
  }

  finalizarLabor() {
    if (this.laborActual && this.laborActual.puntos.length < 2) {
      alert('Una labor debe tener al menos 2 puntos');
      return;
    }
    this.laborActual = null;
    this.nombreLabor = '';
  }

  // ===== CÁLCULOS MINEROS =====
  calcularMediciones() {
    if (!this.laborActual || this.laborActual.puntos.length < 2) {
      this.distanciaTotal = 0;
      this.pendiente = 0;
      return;
    }

    let distancia = 0;
    const puntos = this.laborActual.puntos;

    for (let i = 1; i < puntos.length; i++) {
      const dx = puntos[i].x - puntos[i-1].x;
      const dy = puntos[i].y - puntos[i-1].y;
      distancia += Math.sqrt(dx*dx + dy*dy);
    }

    this.distanciaTotal = Math.round(distancia * 100) / 100;

    // Calcular pendiente (simulada)
    if (puntos.length >= 2) {
      const ultimo = puntos[puntos.length - 1];
      const anterior = puntos[puntos.length - 2];
      const dx = ultimo.x - anterior.x;
      const dy = ultimo.y - anterior.y;
      this.pendiente = dx !== 0 ? Math.round((dy / dx) * 100 * 100) / 100 : 0;
    }
  }

  // ===== DIBUJO =====
  redibujar() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.zoom, this.zoom);

    // Dibujar grid
    if (this.mostrarGrid) {
      this.dibujarGrid();
    }

    // Dibujar ejes
    this.dibujarEjes();

    // Dibujar todas las labores
    this.labores.forEach(labor => {
      this.dibujarLabor(labor);
    });

    // Dibujar labor actual en curso
    if (this.laborActual) {
      this.dibujarLabor(this.laborActual, true);
    }

    this.ctx.restore();
  }

  private dibujarGrid() {
    const spacing = 20;
    const canvas = this.canvasRef.nativeElement;
    const ancho = canvas.width / this.zoom;
    const alto = canvas.height / this.zoom;
    
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;

    // Líneas verticales
    for (let x = -ancho; x < ancho; x += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -alto);
      this.ctx.lineTo(x, alto);
      this.ctx.stroke();
    }

    // Líneas horizontales
    for (let y = -alto; y < alto; y += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(-ancho, y);
      this.ctx.lineTo(ancho, y);
      this.ctx.stroke();
    }
  }

  private dibujarEjes() {
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(-10000, 0);
    this.ctx.lineTo(10000, 0);
    this.ctx.moveTo(0, -10000);
    this.ctx.lineTo(0, 10000);
    this.ctx.stroke();

    // Numeración de ejes
    this.ctx.fillStyle = '#888';
    this.ctx.font = '12px Arial';
    
    for (let x = -500; x <= 500; x += 50) {
      if (x !== 0) {
        this.ctx.fillText(x.toString(), x - 10, 15);
      }
    }
    
    for (let y = -500; y <= 500; y += 50) {
      if (y !== 0) {
        this.ctx.fillText(y.toString(), 5, -y + 5);
      }
    }
  }

  private dibujarLabor(labor: Labor, esActual: boolean = false) {
    if (labor.puntos.length === 0) return;

    // Dibujar líneas
    this.ctx.strokeStyle = labor.color;
    this.ctx.lineWidth = esActual ? 3 : 2;
    this.ctx.setLineDash(esActual ? [] : []);
    
    this.ctx.beginPath();
    this.ctx.moveTo(labor.puntos[0].x, labor.puntos[0].y);
    
    for (let i = 1; i < labor.puntos.length; i++) {
      this.ctx.lineTo(labor.puntos[i].x, labor.puntos[i].y);
    }
    this.ctx.stroke();

    // Dibujar puntos
    labor.puntos.forEach((punto, index) => {
      this.ctx.fillStyle = esActual && index === labor.puntos.length - 1 ? '#ffff00' : '#ffffff';
      this.ctx.strokeStyle = labor.color;
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.arc(punto.x, punto.y, esActual ? 4 : 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Etiquetas de puntos
      if (this.mostrarCoordenadas) {
        this.ctx.fillStyle = labor.color;
        this.ctx.font = '10px Arial';
        this.ctx.fillText(
          `${punto.nombre} (${punto.x}, ${punto.y})`, 
          punto.x + 8, 
          punto.y - 8
        );
      }
    });

    // Etiqueta de la labor
    if (labor.puntos.length > 0) {
      const primerPunto = labor.puntos[0];
      this.ctx.fillStyle = labor.color;
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(labor.nombre, primerPunto.x + 15, primerPunto.y - 15);
    }
  }

  // ===== CONTROLES DE CÁMARA =====
  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.canvasRef.nativeElement.style.cursor = 'grabbing';
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.offsetX += dx;
      this.offsetY += dy;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.redibujar();
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.canvasRef.nativeElement.style.cursor = 'grab';
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - this.offsetX) / this.zoom;
    const worldY = (mouseY - this.offsetY) / this.zoom;

    if (e.deltaY < 0) {
      this.zoom *= zoomFactor;
    } else {
      this.zoom /= zoomFactor;
    }

    // Mantener el punto bajo el mouse fijo
    this.offsetX = mouseX - worldX * this.zoom;
    this.offsetY = mouseY - worldY * this.zoom;

    this.redibujar();
  }

  // ===== UTILIDADES =====
  limpiarTodo() {
    this.labores = [];
    this.laborActual = null;
    this.distanciaTotal = 0;
    this.pendiente = 0;
    this.redibujar();
  }

  exportarDatos() {
    const datos = {
      labores: this.labores,
      fecha: new Date().toISOString(),
      totalLabores: this.labores.length
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labores-mineras.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  centrarVista() {
    this.offsetX = 400;
    this.offsetY = 300;
    this.zoom = 1;
    this.redibujar();
  }

  getColorLabor() {
    const tipo = this.tiposLabor.find(t => t.value === this.laborSeleccionada);
    return tipo ? tipo.color : '#ffffff';
  }

  getPuntosLaborActual() {
    return this.laborActual ? this.laborActual.puntos.length : 0;
  }
}