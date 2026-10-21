import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService, ClienteDto } from '../cliente.service';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule],
  templateUrl: './clientes.html'
})
export class Clientes {
  private servicio = inject(ClienteService);
  lista = signal<ClienteDto[]>([]);
  mensaje = signal('');
  form: ClienteDto = this.nuevo();

  constructor() {
    this.cargar();
  }

  nuevo(): ClienteDto {
    return { id: null, nombres: '', apellidos: '', nit: 'CF', dpi: '', esConsumidorFinal: 'N', estado: 'ACTIVO' };
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.nombres.trim()) {
      this.mensaje.set('El nombre es obligatorio');
      return;
    }
    if (!this.form.nit.trim()) {
      this.form.nit = 'CF';
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el DPI puede estar repetido)')
    });
  }

  editar(c: ClienteDto) {
    this.form = { ...c };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(c: ClienteDto) {
    if (c.esConsumidorFinal === 'S') {
      this.mensaje.set('El cliente Consumidor Final no se puede eliminar');
      return;
    }
    if (!confirm('¿Eliminar al cliente ' + c.nombres + '?')) return;
    this.servicio.eliminar(c.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene facturas asociadas)')
    });
  }
}