import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeguridadService, BitacoraFila } from '../seguridad.service';

@Component({
  selector: 'app-bitacora',
  imports: [FormsModule],
  templateUrl: './bitacora.html'
})
export class Bitacora {
  private servicio = inject(SeguridadService);

  filas = signal<BitacoraFila[]>([]);
  tablas = signal<string[]>([]);
  mensaje = signal('');
  tabla = '';
  tipo = '';

  constructor() {
    this.servicio.tablasBitacora().subscribe(d => this.tablas.set(d));
    this.filtrar();
  }

  filtrar() {
    this.servicio.bitacora(this.tabla, this.tipo).subscribe({
      next: d => this.filas.set(d),
      error: e => this.mensaje.set(e?.error?.mensaje ?? 'No se pudo cargar la bitácora')
    });
  }
}