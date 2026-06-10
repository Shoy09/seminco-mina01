import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css'
})
export class SchedulerComponent implements OnChanges {

  @Input() data: any[] = [];

  // ================= TURNO CONFIG =================
  shiftStartHour = 7;                 // 07:00 AM
  timelineStart = this.shiftStartHour * 60;   // 420
  timelineEnd   = this.timelineStart + 24 * 60; // 1860

  hours: string[] = [];

  groups: any[] = [];

  constructor() {
    this.generateHours();
  }

  // ================= LIFECYCLE =================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.length) {
      this.normalizeData();
    }
  }

  // ================= HOURS HEADER =================
  generateHours(): void {
    this.hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (this.shiftStartHour + i) % 24;
      return String(hour).padStart(2, '0') + ':00';
    });
  }

  // ================= NORMALIZE =================
  normalizeData(): void {
    this.groups = this.data.map(fechaItem => ({
      fecha: fechaItem.fecha,
      equipos: fechaItem.groups.map((grupo: any) => {
        const tasks: any[] = [];

        grupo.rows.forEach((row: any) => {
          row.tasks.forEach((task: any) => {

            let startMin = this.toMinutes(task.start);
            let endMin   = this.toMinutes(task.end);

            // 🔥 Cruce de medianoche
            if (endMin <= startMin) {
              endMin += 1440;
            }

            // 🔥 Ajuste al eje que inicia en 07:00
            if (startMin < this.timelineStart) {
              startMin += 1440;
              endMin   += 1440;
            }

            tasks.push({
              ...task,
              labor: row.labor || '',
              startMin,
              endMin
            });
          });
        });

        return {
          equipoCodigo: grupo.equipoCodigo,
          tasks
        };
      })
    }));

    console.log('🧩 NORMALIZED SHIFT DATA:', this.groups);
  }

  // ================= TIME UTILS =================
  toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  // ================= STYLE =================
getTaskStyle(task: any): any {
  const total = this.timelineEnd - this.timelineStart;
  const duration = task.endMin - task.startMin;

  const leftPercent = ((task.startMin - this.timelineStart) / total) * 100;
  const widthPercent = (duration / total) * 100;

  return {
    left: `${leftPercent}%`,
    width: `calc(${widthPercent}% - 1px)`, // 🔥 CLAVE
    background: this.getColor(task.estado)
  };
}


  // ================= COLORS =================
  getColor(estado: string): string {
    const colors: any = {
      OPERATIVO: "#2ECC71",
  DEMORA: "#F1C40F",
  MANTENIMIENTO: "#E74C3C",
  RESERVA: "#E67E22",
  "FUERA DE PLAN": "#3498DB"
    };
    return colors[estado] || '#95a5a6';
  }

  // ================= TRACK BY =================
  trackByEquipo(_: number, item: any) {
    return item.equipoCodigo;
  }

  trackByTask(_: number, item: any) {
    return item.start + item.end + item.labor;
  }
  minutesToTime(min: number): string {
  const m = min % 1440; // normaliza si pasó medianoche
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

getTaskTooltip(task: any): string {
  const inicio = this.minutesToTime(task.startMin);
  const fin    = this.minutesToTime(task.endMin);

  return `Inicio: ${inicio}\nFin: ${fin}`;
}
}
