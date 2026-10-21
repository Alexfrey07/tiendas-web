import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SucursalService, SucursalDto } from '../sucursal.service';
import { MunicipioService, MunicipioDto } from '../municipio.service';

@Component({
  selector: 'app-sucursales',
  imports: [FormsModule],
  templateUrl: './sucursales.html'
})
export class Sucursales {
  private servicio = inject(SucursalService);
  private servicioMun = inject(MunicipioService);
  lista = signal<SucursalDto[]>([]);
  municipios = signal<MunicipioDto[]>([]);
  mensaje = signal('');
  form: SucursalDto = this.nuevo();

  constructor() {
    this.servicioMun.listar().subscribe({
      next: datos => this.municipios.set(datos),
      error: () => this.mensaje.set('No se pudieron cargar los municipios')
    });
    this.cargar();
  }

  nuevo(): SucursalDto {
    return { id: null, idMunicipio: null, nombre: '', esCabecera: 'N', estado: 'ACTIVO' };
  }

  nombreMunicipio(id: number | null): string {
    return this.municipios().find(m => m.id === id)?.nombre ?? '';
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.idMunicipio || !this.form.nombre.trim()) {
      this.mensaje.set('El municipio y el nombre son obligatorios');
      return;
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el nombre de la sucursal puede estar repetido)')
    });
  }

  editar(s: SucursalDto) {
    this.form = { ...s };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(s: SucursalDto) {
    if (!confirm('¿Eliminar la sucursal ' + s.nombre + '?')) return;
    this.servicio.eliminar(s.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene empleados, inventario o facturas)')
    });
  }
}