import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartamentoService, DepartamentoDto } from '../departamento.service';

@Component({
  selector: 'app-departamentos',
  imports: [FormsModule],
  templateUrl: './departamentos.html'
})
export class Departamentos {
  private servicio = inject(DepartamentoService);
  lista = signal<DepartamentoDto[]>([]);
  mensaje = signal('');
  form: DepartamentoDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): DepartamentoDto {
    return { id: null, nombre: '', cabecera: '' };
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.nombre.trim() || !this.form.cabecera.trim()) {
      this.mensaje.set('El nombre y la cabecera son obligatorios');
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

  editar(d: DepartamentoDto) {
    this.form = { ...d };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(d: DepartamentoDto) {
    if (!confirm('¿Eliminar el departamento ' + d.nombre + '?')) return;
    this.servicio.eliminar(d.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene municipios asociados)')
    });
  }
}