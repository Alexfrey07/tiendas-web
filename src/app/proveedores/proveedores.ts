import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProveedorService, ProveedorDto } from '../proveedor.service';

@Component({
  selector: 'app-proveedores',
  imports: [FormsModule],
  templateUrl: './proveedores.html'
})
export class Proveedores {
  private servicio = inject(ProveedorService);
  lista = signal<ProveedorDto[]>([]);
  mensaje = signal('');
  form: ProveedorDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): ProveedorDto {
    return { id: null, nit: '', razonSocial: '', estado: 'ACTIVO' };
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.nit.trim() || !this.form.razonSocial.trim()) {
      this.mensaje.set('El NIT y la razón social son obligatorios');
      return;
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el NIT puede estar repetido)')
    });
  }

  editar(p: ProveedorDto) {
    this.form = { ...p };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(p: ProveedorDto) {
    if (!confirm('¿Eliminar el proveedor ' + p.razonSocial + '?')) return;
    this.servicio.eliminar(p.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene compras asociadas)')
    });
  }
}