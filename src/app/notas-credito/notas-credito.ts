import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotaCreditoService, NotaFila, LineaNC, DetalleNota } from '../nota-credito.service';
import { FacturaService, FacturaFila } from '../factura.service';

@Component({
  selector: 'app-notas-credito',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './notas-credito.html'
})
export class NotasCredito {
  private servicio = inject(NotaCreditoService);
  private servicioFac = inject(FacturaService);

  lista = signal<NotaFila[]>([]);
  facturas = signal<FacturaFila[]>([]);
  lineas = signal<LineaNC[]>([]);
  detalle = signal<DetalleNota[]>([]);
  detalleDe = signal<number | null>(null);
  mensaje = signal('');
  esError = signal(false);

  idFactura: number | null = null;
  motivo = '';

  constructor() {
    this.servicioFac.listar().subscribe(d => this.facturas.set(d));
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

  elegirFactura(id: number | null) {
    this.idFactura = id;
    this.lineas.set([]);
    if (!id) return;
    this.servicio.lineas(id).subscribe({
      next: d => this.lineas.set(d.map(l => ({ ...l, devolver: 0, reingresa: 'S' }))),
      error: e => this.fallo(e)
    });
  }

  disponible(l: LineaNC): number {
    return l.facturada - l.devuelta;
  }

  montoTotal(): number {
    const suma = this.lineas().reduce((s, l) => s + (l.devolver > 0 ? l.devolver * l.precio : 0), 0);
    return Math.round(suma * 100) / 100;
  }

  guardar() {
    if (!this.idFactura) {
      this.esError.set(true);
      this.mensaje.set('Elija la factura');
      return;
    }
    if (!this.motivo.trim()) {
      this.esError.set(true);
      this.mensaje.set('El motivo es obligatorio');
      return;
    }
    const aDevolver = this.lineas().filter(l => l.devolver > 0);
    if (aDevolver.length === 0) {
      this.esError.set(true);
      this.mensaje.set('Indique la cantidad a devolver de al menos un producto');
      return;
    }
    const excedida = aDevolver.find(l => l.devolver > this.disponible(l));
    if (excedida) {
      this.esError.set(true);
      this.mensaje.set('La cantidad de ' + excedida.producto + ' supera lo disponible (' + this.disponible(excedida) + ')');
      return;
    }
    this.servicio.crear({
      idFactura: this.idFactura,
      motivo: this.motivo,
      lineas: aDevolver.map(l => ({
        idDetalleFactura: l.idDetalleFactura, cantidad: l.devolver, reingresa: l.reingresa
      }))
    }).subscribe({
      next: r => {
        const factura = this.idFactura;
        this.motivo = '';
        this.ok('Nota de crédito ' + r.serie + '-' + r.numero + ' emitida por Q ' + r.total.toFixed(2));
        this.cargar();
        this.elegirFactura(factura);
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