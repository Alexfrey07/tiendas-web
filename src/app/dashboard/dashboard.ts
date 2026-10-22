import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ReporteService, DashboardDatos, Punto } from '../reporte.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html'
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private servicio = inject(ReporteService);

  @ViewChild('cSucursal') cSucursal!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cCategoria') cCategoria!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cProductos') cProductos!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cReclamos') cReclamos!: ElementRef<HTMLCanvasElement>;

  kpis = signal<DashboardDatos['kpis'] | null>(null);
  mensaje = signal('');
  private graficos: Chart[] = [];
  private colores = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0', '#fd7e14', '#20c997'];

  ngAfterViewInit() {
    this.servicio.dashboard().subscribe({
      next: d => {
        this.kpis.set(d.kpis);
        this.graficos.push(
          this.barras(this.cSucursal, d.ventasSucursal, 'Ventas (Q)'),
          this.dona(this.cCategoria, d.ventasCategoria),
          this.barras(this.cProductos, d.topProductos, 'Unidades vendidas'),
          this.dona(this.cReclamos, d.reclamos)
        );
      },
      error: () => this.mensaje.set('No se pudo cargar el dashboard')
    });
  }

  ngOnDestroy() {
    this.graficos.forEach(g => g.destroy());
  }

  private barras(canvas: ElementRef<HTMLCanvasElement>, puntos: Punto[], titulo: string): Chart {
    return new Chart(canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: puntos.map(p => p.etiqueta),
        datasets: [{ label: titulo, data: puntos.map(p => p.valor), backgroundColor: this.colores[0] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  private dona(canvas: ElementRef<HTMLCanvasElement>, puntos: Punto[]): Chart {
    return new Chart(canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: puntos.map(p => p.etiqueta),
        datasets: [{ data: puntos.map(p => p.valor), backgroundColor: this.colores }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}