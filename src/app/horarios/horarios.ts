import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioService, HorarioDto } from '../horario.service';

@Component({
  selector: 'app-horarios',
  imports: [FormsModule],
  templateUrl: './horarios.html'
})
export class Horarios {
  private servicio = inject(HorarioService);
  lista = signal<HorarioDto[]>([]);
  mensaje = signal('');
  form: HorarioDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): HorarioDto {
    return { id: null, nombreHorario: '', horaEntrada: '', horaSalida: '' };
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.nombreHorario.trim() || !this.form.horaEntrada || !this.form.horaSalida) {
      this.mensaje.set('El nombre, la hora de entrada y la hora de salida son obligatorios');
      return;
    }
    if (this.form.horaSalida <= this.form.horaEntrada) {
      this.mensaje.set('La hora de salida debe ser mayor que la de entrada');
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

  editar(h: HorarioDto) {
    this.form = { ...h };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(h: HorarioDto) {
    if (!confirm('¿Eliminar el horario ' + h.nombreHorario + '?')) return;
    this.servicio.eliminar(h.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (hay empleados con este horario)')
    });
  }
}