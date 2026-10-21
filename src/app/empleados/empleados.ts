import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpleadoService, EmpleadoDto } from '../empleado.service';
import { SucursalService, SucursalDto } from '../sucursal.service';
import { PuestoService, PuestoDto } from '../puesto.service';

@Component({
  selector: 'app-empleados',
  imports: [FormsModule],
  templateUrl: './empleados.html'
})
export class Empleados {
  private servicio = inject(EmpleadoService);
  private servicioSuc = inject(SucursalService);
  private servicioPue = inject(PuestoService);
  lista = signal<EmpleadoDto[]>([]);
  sucursales = signal<SucursalDto[]>([]);
  puestos = signal<PuestoDto[]>([]);
  mensaje = signal('');
  form: EmpleadoDto = this.nuevo();

  constructor() {
    this.servicioSuc.listar().subscribe({
      next: datos => this.sucursales.set(datos),
      error: () => this.mensaje.set('No se pudieron cargar las sucursales')
    });
    this.servicioPue.listar().subscribe({
      next: datos => this.puestos.set(datos),
      error: () => this.mensaje.set('No se pudieron cargar los puestos')
    });
    this.cargar();
  }

  nuevo(): EmpleadoDto {
    return {
      id: null, idSucursal: null, idPuesto: null, nombres: '', apellidos: '',
      dpi: '', nit: '', salario: 0, fechaNacimiento: null, estado: 'ACTIVO'
    };
  }

  nombreSucursal(id: number | null): string {
    return this.sucursales().find(s => s.id === id)?.nombre ?? '';
  }

  nombrePuesto(id: number | null): string {
    return this.puestos().find(p => p.id === id)?.nombre ?? '';
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.idSucursal || !this.form.idPuesto || !this.form.nombres.trim() || !this.form.apellidos.trim()) {
      this.mensaje.set('La sucursal, el puesto, los nombres y los apellidos son obligatorios');
      return;
    }
    if (this.form.salario === null || this.form.salario < 0) {
      this.mensaje.set('El salario no puede ser negativo');
      return;
    }
    this.form.fechaNacimiento = this.form.fechaNacimiento || null;
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el DPI puede estar repetido)')
    });
  }

  editar(e: EmpleadoDto) {
    this.form = { ...e };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(e: EmpleadoDto) {
    if (!confirm('¿Eliminar al empleado ' + e.nombres + ' ' + e.apellidos + '?')) return;
    this.servicio.eliminar(e.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene usuario, facturas o compras asociadas)')
    });
  }
}