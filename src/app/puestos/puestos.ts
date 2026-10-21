import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PuestoService, PuestoDto } from '../puesto.service';

@Component({
  selector: 'app-puestos',
  imports: [FormsModule],
  templateUrl: './puestos.html'
})
export class Puestos {
  private servicio = inject(PuestoService);
  lista = signal<PuestoDto[]>([]);
  mensaje = signal('');
  form: PuestoDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): PuestoDto {
    return { id: null, nombre: '', descripcion: '' };
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.nombre.trim()) {
      this.mensaje.set('El nombre es obligatorio');
      return;
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el nombre puede estar repetido)')
    });
  }

  editar(p: PuestoDto) {
    this.form = { ...p };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(p: PuestoDto) {
    if (!confirm('¿Eliminar el puesto ' + p.nombre + '?')) return;
    this.servicio.eliminar(p.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (hay empleados con este puesto)')
    });
  }
}