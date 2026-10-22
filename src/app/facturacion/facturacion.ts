import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FacturaService, FacturaFila, ProductoDisponible, TipoPago,
  LineaFactura, PagoFactura, DetalleFactura
} from '../factura.service';
import { ClienteService, ClienteDto } from '../cliente.service';
import { SucursalService, SucursalDto } from '../sucursal.service';

@Component({
  selector: 'app-facturacion',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './facturacion.html'
})
export class Facturacion {
  private servicio = inject(FacturaService);
  private servicioCli = inject(ClienteService);
  private servicioSuc = inject(SucursalService);

  lista = signal<FacturaFila[]>([]);
  detalle = signal<DetalleFactura | null>(null);
  detalleDe = signal<number | null>(null);
  clientes = signal<ClienteDto[]>([]);
  sucursales = signal<SucursalDto[]>([]);
  disponibles = signal<ProductoDisponible[]>([]);
  tiposPago = signal<TipoPago[]>([]);
  lineas = signal<LineaFactura[]>([]);
  pagos = signal<PagoFactura[]>([]);
  mensaje = signal('');
  esError = signal(false);

  total = computed(() => this.redondear(this.lineas().reduce((s, l) => s + l.cantidad * l.precio, 0)));
  pagado = computed(() => this.redondear(this.pagos().reduce((s, p) => s + p.monto, 0)));
  pendiente = computed(() => this.redondear(this.total() - this.pagado()));

  idCliente: number | null = null;
  idSucursal: number | null = null;
  lineaProducto: number | null = null;
  lineaCantidad = 1;
  pagoTipo: number | null = null;
  pagoMonto = 0;
  pagoReferencia = '';

  constructor() {
    this.servicioCli.listar().subscribe(d => {
      this.idCliente = d.find(c => c.esConsumidorFinal === 'S')?.id ?? null;
      this.clientes.set(d.filter(c => c.estado === 'ACTIVO'));
    });
    this.servicioSuc.listar().subscribe(d => this.sucursales.set(d.filter(s => s.estado === 'ACTIVO')));
    this.servicio.tiposPago().subscribe(d => this.tiposPago.set(d));
    this.cargar();
  }

  private redondear(n: number): number {
    return Math.round(n * 100) / 100;
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

  cargarDisponibles() {
    if (!this.idSucursal) {
      this.disponibles.set([]);
      return;
    }
    this.servicio.productos(this.idSucursal).subscribe({
      next: d => this.disponibles.set(d),
      error: e => this.fallo(e)
    });
  }

  cambiarSucursal(id: number | null) {
    this.idSucursal = id;
    this.lineas.set([]);
    this.pagos.set([]);
    this.lineaProducto = null;
    this.cargarDisponibles();
  }

  agregarLinea() {
    const p = this.disponibles().find(x => x.id === this.lineaProducto);
    if (!p || !this.lineaCantidad || this.lineaCantidad <= 0) {
      this.esError.set(true);
      this.mensaje.set('Elija un producto y una cantidad mayor a cero');
      return;
    }
    const actual = this.lineas();
    const existente = actual.find(l => l.idProducto === p.id);
    const yaEnLista = existente ? existente.cantidad : 0;
    if (yaEnLista + this.lineaCantidad > p.existencia) {
      this.esError.set(true);
      this.mensaje.set('No hay existencia suficiente de ' + p.nombre + '. Disponible: ' + p.existencia);
      return;
    }
    if (existente) {
      this.lineas.set(actual.map(l => l.idProducto === p.id
        ? { ...l, cantidad: l.cantidad + this.lineaCantidad } : l));
    } else {
      this.lineas.set([...actual, {
        idProducto: p.id, codigo: p.codigo, producto: p.nombre,
        cantidad: this.lineaCantidad, precio: p.precio, existencia: p.existencia
      }]);
    }
    this.lineaProducto = null;
    this.lineaCantidad = 1;
    this.mensaje.set('');
  }

  quitarLinea(i: number) {
    this.lineas.set(this.lineas().filter((_, idx) => idx !== i));
    this.pagos.set([]);
  }

  agregarPago() {
    const tipo = this.tiposPago().find(t => t.id === this.pagoTipo);
    const monto = this.pagoMonto > 0 ? this.redondear(this.pagoMonto) : this.pendiente();
    if (!tipo) {
      this.esError.set(true);
      this.mensaje.set('Elija el tipo de pago');
      return;
    }
    if (monto <= 0 || monto > this.pendiente()) {
      this.esError.set(true);
      this.mensaje.set('El monto debe ser mayor a cero y no puede superar lo pendiente (Q ' + this.pendiente().toFixed(2) + ')');
      return;
    }
    this.pagos.set([...this.pagos(), {
      idTipoPago: tipo.id, tipoPago: tipo.nombre, monto, referencia: this.pagoReferencia
    }]);
    this.pagoTipo = null;
    this.pagoMonto = 0;
    this.pagoReferencia = '';
    this.mensaje.set('');
  }

  quitarPago(i: number) {
    this.pagos.set(this.pagos().filter((_, idx) => idx !== i));
  }

  guardar() {
    if (!this.idCliente || !this.idSucursal) {
      this.esError.set(true);
      this.mensaje.set('El cliente y la sucursal son obligatorios');
      return;
    }
    if (this.lineas().length === 0) {
      this.esError.set(true);
      this.mensaje.set('Agregue al menos un producto');
      return;
    }
    if (this.pendiente() !== 0) {
      this.esError.set(true);
      this.mensaje.set('Los pagos deben cubrir el total. Falta: Q ' + this.pendiente().toFixed(2));
      return;
    }
    this.servicio.crear({
      idCliente: this.idCliente,
      idSucursal: this.idSucursal,
      lineas: this.lineas().map(l => ({ idProducto: l.idProducto, cantidad: l.cantidad })),
      pagos: this.pagos().map(p => ({ idTipoPago: p.idTipoPago, monto: p.monto, referencia: p.referencia }))
    }).subscribe({
      next: r => {
        this.lineas.set([]);
        this.pagos.set([]);
        this.ok('Factura ' + r.serie + '-' + r.numero + ' emitida por Q ' + r.total.toFixed(2));
        this.cargar();
        this.cargarDisponibles();
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
}