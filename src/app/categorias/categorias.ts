import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService, CategoriaDto } from '../categoria.service';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html'
})
export class Categorias {
  private servicio = inject(CategoriaService);
  lista = signal<CategoriaDto[]>([]);
  mensaje = signal('');
  form: CategoriaDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): CategoriaDto {
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

  editar(c: CategoriaDto) {
    this.form = { ...c };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(c: CategoriaDto) {
    if (!confirm('¿Eliminar la categoría ' + c.nombre + '?')) return;
    this.servicio.eliminar(c.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (puede estar en uso)')
    });
  }
}