import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService, CompraFila, DetalleCompra, LineaCompra } from '../compra.service';
import { ProveedorService, ProveedorDto } from '../proveedor.service';
import { SucursalService, SucursalDto } from '../sucursal.service';
import { ProductoService, ProductoDto } from '../producto.service';

@Component({
  selector: 'app-compras',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './compras.html'
})
export class Compras {
  private servicio = inject(CompraService);
  private servicioProv = inject(ProveedorService);
  private servicioSuc = inject(SucursalService);
  private servicioPro = inject(ProductoService);

  lista = signal<CompraFila[]>([]);
  detalle = signal<DetalleCompra[]>([]);
  detalleDe = signal<number | null>(null);
  proveedores = signal<ProveedorDto[]>([]);
  sucursales = signal<SucursalDto[]>([]);
  productos = signal<ProductoDto[]>([]);
  lineas = signal<LineaCompra[]>([]);
  total = computed(() => this.lineas().reduce((suma, l) => suma + l.cantidad * l.costoUnitario, 0));
  mensaje = signal('');
  esError = signal(false);

  idProveedor: number | null = null;
  idSucursal: number | null = null;
  numeroDocumento = '';
  observaciones = '';

  lineaProducto: number | null = null;
  lineaCantidad = 1;
  lineaCosto = 0;

  constructor() {
    this.servicioProv.listar().subscribe(d => this.proveedores.set(d.filter(p => p.estado === 'ACTIVO')));
    this.servicioSuc.listar().subscribe(d => this.sucursales.set(d.filter(s => s.estado === 'ACTIVO')));
    this.servicioPro.listar().subscribe(d => this.productos.set(d.filter(p => p.estado === 'ACTIVO')));
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
    this.servicio.listar().subscribe({
      next: d => this.lista.set(d),
      error: e => this.fallo(e)
    });
  }

  elegirProducto(id: number | null) {
    this.lineaProducto = id;
    const p = this.productos().find(x => x.id === id);
    this.lineaCosto = p ? p.costo : 0;
  }

  agregarLinea() {
    if (!this.lineaProducto || this.lineaCantidad <= 0 || this.lineaCosto < 0) {
      this.esError.set(true);
      this.mensaje.set('Elija un producto, una cantidad mayor a cero y un costo válido');
      return;
    }
    const p = this.productos().find(x => x.id === this.lineaProducto)!;
    const actual = this.lineas();
    const existente = actual.find(l => l.idProducto === p.id);
    if (existente) {
      this.lineas.set(actual.map(l => l.idProducto === p.id
        ? { ...l, cantidad: l.cantidad + this.lineaCantidad, costoUnitario: this.lineaCosto }
        : l));
    } else {
      this.lineas.set([...actual, {
        idProducto: p.id!, producto: p.nombre, cantidad: this.lineaCantidad, costoUnitario: this.lineaCosto
      }]);
    }
    this.lineaProducto = null;
    this.lineaCantidad = 1;
    this.lineaCosto = 0;
    this.mensaje.set('');
  }

  quitarLinea(i: number) {
    this.lineas.set(this.lineas().filter((_, idx) => idx !== i));
  }

  guardar() {
    if (!this.idProveedor || !this.idSucursal || !this.numeroDocumento.trim()) {
      this.esError.set(true);
      this.mensaje.set('El proveedor, la sucursal y el número de documento son obligatorios');
      return;
    }
    if (this.lineas().length === 0) {
      this.esError.set(true);
      this.mensaje.set('Agregue al menos un producto');
      return;
    }
    this.servicio.crear({
      idProveedor: this.idProveedor,
      idSucursal: this.idSucursal,
      numeroDocumento: this.numeroDocumento,
      observaciones: this.observaciones,
      lineas: this.lineas().map(l => ({
        idProducto: l.idProducto, cantidad: l.cantidad, costoUnitario: l.costoUnitario
      }))
    }).subscribe({
      next: () => {
        this.idProveedor = null;
        this.idSucursal = null;
        this.numeroDocumento = '';
        this.observaciones = '';
        this.lineas.set([]);
        this.ok('Compra guardada como PENDIENTE. Use "Recibir" cuando llegue la mercadería.');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  ver(id: number) {
    this.detalleDe.set(id);
    this.servicio.detalle(id).subscribe({
      next: d => this.detalle.set(d),
      error: e => this.fallo(e)
    });
  }

  recibir(c: CompraFila) {
    if (!confirm('¿Recibir la compra ' + c.numeroDocumento + '? Se sumará al inventario.')) return;
    this.servicio.recibir(c.id).subscribe({
      next: () => {
        this.ok('Compra recibida: el inventario fue actualizado');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  cancelar(c: CompraFila) {
    if (!confirm('¿Cancelar la compra ' + c.numeroDocumento + '?')) return;
    this.servicio.cancelar(c.id).subscribe({
      next: () => {
        this.ok('Compra cancelada');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }
}