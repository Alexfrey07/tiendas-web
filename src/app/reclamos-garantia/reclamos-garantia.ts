import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReclamoService, ReclamoFila, GarantiaFila } from '../reclamo.service';
import { SucursalService, SucursalDto } from '../sucursal.service';
import { FacturaService, ProductoDisponible } from '../factura.service';

@Component({
  selector: 'app-reclamos-garantia',
  imports: [FormsModule],
  templateUrl: './reclamos-garantia.html'
})
export class ReclamosGarantia {
  private servicio = inject(ReclamoService);
  private servicioSuc = inject(SucursalService);
  private servicioFac = inject(FacturaService);

  lista = signal<ReclamoFila[]>([]);
  garantias = signal<GarantiaFila[]>([]);
  sucursales = signal<SucursalDto[]>([]);
  vigentes = computed(() => this.garantias().filter(g => g.estado === 'VIGENTE' && g.cubierta - g.reclamada > 0));
  mensaje = signal('');
  esError = signal(false);

  idGarantia: number | null = null;
  idSucursal: number | null = null;
  cantidad = 1;
  descripcion = '';

  cerrando = signal<ReclamoFila | null>(null);
  disponibles = signal<ProductoDisponible[]>([]);
  resolucion = 'REPARACION';
  aprobada = 1;
  idReemplazo: number | null = null;

  constructor() {
    this.servicioSuc.listar().subscribe(d => this.sucursales.set(d.filter(s => s.estado === 'ACTIVO')));
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
    this.servicio.garantias().subscribe({
      next: d => this.garantias.set(d),
      error: e => this.fallo(e)
    });
  }

  infoGarantia(): GarantiaFila | undefined {
    return this.garantias().find(g => g.id === this.idGarantia);
  }

  guardar() {
    const g = this.infoGarantia();
    if (!this.idGarantia || !this.idSucursal || !this.descripcion.trim()) {
      this.esError.set(true);
      this.mensaje.set('La garantía, la sucursal y la descripción de la falla son obligatorias');
      return;
    }
    if (!this.cantidad || this.cantidad <= 0 || (g && this.cantidad > g.cubierta - g.reclamada)) {
      this.esError.set(true);
      this.mensaje.set('La cantidad debe ser mayor a cero y no superar lo cubierto');
      return;
    }
    this.servicio.crear({
      idGarantia: this.idGarantia,
      idSucursal: this.idSucursal,
      descripcion: this.descripcion,
      cantidad: this.cantidad
    }).subscribe({
      next: () => {
        this.idGarantia = null;
        this.idSucursal = null;
        this.cantidad = 1;
        this.descripcion = '';
        this.ok('Reclamo registrado como RECIBIDO');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  enProceso(r: ReclamoFila) {
    this.servicio.enProceso(r.id).subscribe({
      next: () => {
        this.ok('Reclamo marcado en proceso');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  abrirCierre(r: ReclamoFila) {
    this.cerrando.set(r);
    this.resolucion = 'REPARACION';
    this.aprobada = r.reclamada;
    this.idReemplazo = null;
    this.disponibles.set([]);
  }

  cancelarCierre() {
    this.cerrando.set(null);
  }

  cambiarResolucion(valor: string) {
    this.resolucion = valor;
    const r = this.cerrando();
    if (!r) return;
    this.aprobada = valor === 'RECHAZADO' ? 0 : r.reclamada;
    this.idReemplazo = null;
    if (valor === 'CAMBIO') {
      this.servicioFac.productos(r.idSucursal).subscribe({
        next: d => this.disponibles.set(d),
        error: e => this.fallo(e)
      });
    }
  }

  confirmarCierre() {
    const r = this.cerrando();
    if (!r) return;
    if (this.resolucion === 'CAMBIO' && !this.idReemplazo) {
      this.esError.set(true);
      this.mensaje.set('Elija el producto de reemplazo');
      return;
    }
    this.servicio.cerrar(r.id, {
      tipoResolucion: this.resolucion,
      cantidadAprobada: this.aprobada,
      idProductoReemplazo: this.resolucion === 'CAMBIO' ? this.idReemplazo : null
    }).subscribe({
      next: () => {
        this.cerrando.set(null);
        this.ok('Reclamo cerrado correctamente');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }
}