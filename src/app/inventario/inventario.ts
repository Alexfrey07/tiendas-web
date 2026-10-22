import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventarioService, InventarioFila, MovimientoFila } from '../inventario.service';
import { SucursalService, SucursalDto } from '../sucursal.service';

@Component({
  selector: 'app-inventario',
  imports: [FormsModule],
  templateUrl: './inventario.html'
})
export class Inventario {
  private servicio = inject(InventarioService);
  private servicioSuc = inject(SucursalService);

  lista = signal<InventarioFila[]>([]);
  movimientos = signal<MovimientoFila[]>([]);
  sucursales = signal<SucursalDto[]>([]);
  vista = signal<'existencias' | 'kardex'>('existencias');
  mensaje = signal('');
  esError = signal(false);

  idSucursal: number | null = null;

  ajustando = signal<InventarioFila | null>(null);
  nuevaExistencia = 0;
  justificacion = '';

  editandoMinimo = signal<InventarioFila | null>(null);
  nuevoMinimo = 0;

  constructor() {
    this.servicioSuc.listar().subscribe(d => this.sucursales.set(d));
    this.cargar();
  }

  private ok(texto: string) {
    this.esError.set(false);
    this.mensaje.set(texto);
  }

  private fallo(err: any) {
    this.esError.set(true);
    this.mensaje.set(err?.error?.mensaje ?? 'Ocurrió un error');
  }

  cargar() {
    this.servicio.listar(this.idSucursal).subscribe({
      next: d => this.lista.set(d),
      error: e => this.fallo(e)
    });
    this.servicio.kardex(this.idSucursal).subscribe({
      next: d => this.movimientos.set(d),
      error: e => this.fallo(e)
    });
  }

  cambiarSucursal(id: number | null) {
    this.idSucursal = id;
    this.ajustando.set(null);
    this.editandoMinimo.set(null);
    this.cargar();
  }

  abrirAjuste(f: InventarioFila) {
    this.editandoMinimo.set(null);
    this.ajustando.set(f);
    this.nuevaExistencia = f.existencia;
    this.justificacion = '';
  }

  confirmarAjuste() {
    const f = this.ajustando();
    if (!f) return;
    if (this.nuevaExistencia === null || this.nuevaExistencia < 0) {
      this.esError.set(true);
      this.mensaje.set('La nueva existencia no puede ser negativa');
      return;
    }
    if (this.nuevaExistencia === f.existencia) {
      this.esError.set(true);
      this.mensaje.set('La nueva existencia es igual a la actual');
      return;
    }
    if (!this.justificacion.trim()) {
      this.esError.set(true);
      this.mensaje.set('La justificación del ajuste es obligatoria');
      return;
    }
    this.servicio.ajustar({
      idSucursal: f.idSucursal,
      idProducto: f.idProducto,
      nuevaExistencia: this.nuevaExistencia,
      justificacion: this.justificacion
    }).subscribe({
      next: () => {
        this.ajustando.set(null);
        this.ok('Ajuste realizado: ' + f.producto + ' pasó de ' + f.existencia + ' a ' + this.nuevaExistencia);
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  abrirMinimo(f: InventarioFila) {
    this.ajustando.set(null);
    this.editandoMinimo.set(f);
    this.nuevoMinimo = f.stockMinimo;
  }

  confirmarMinimo() {
    const f = this.editandoMinimo();
    if (!f) return;
    if (this.nuevoMinimo === null || this.nuevoMinimo < 0) {
      this.esError.set(true);
      this.mensaje.set('El stock mínimo no puede ser negativo');
      return;
    }
    this.servicio.cambiarMinimo(f.id, this.nuevoMinimo).subscribe({
      next: () => {
        this.editandoMinimo.set(null);
        this.ok('Stock mínimo actualizado');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }
}