import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MunicipioService, MunicipioDto } from '../municipio.service';
import { DepartamentoService, DepartamentoDto } from '../departamento.service';

@Component({
  selector: 'app-municipios',
  imports: [FormsModule],
  templateUrl: './municipios.html'
})
export class Municipios {
  private servicio = inject(MunicipioService);
  private servicioDep = inject(DepartamentoService);
  lista = signal<MunicipioDto[]>([]);
  departamentos = signal<DepartamentoDto[]>([]);
  mensaje = signal('');
  form: MunicipioDto = this.nuevo();

  constructor() {
    this.servicioDep.listar().subscribe({
      next: datos => this.departamentos.set(datos),
      error: () => this.mensaje.set('No se pudieron cargar los departamentos')
    });
    this.cargar();
  }

  nuevo(): MunicipioDto {
    return { id: null, idDepartamento: null, nombre: '' };
  }

  nombreDepartamento(id: number | null): string {
    return this.departamentos().find(d => d.id === id)?.nombre ?? '';
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.lista.set(datos),
      error: () => this.mensaje.set('No se pudo cargar la lista')
    });
  }

  guardar() {
    if (!this.form.idDepartamento || !this.form.nombre.trim()) {
      this.mensaje.set('El departamento y el nombre son obligatorios');
      return;
    }
    this.servicio.guardar(this.form).subscribe({
      next: () => {
        this.form = this.nuevo();
        this.mensaje.set('Guardado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('Error al guardar (el municipio ya existe en ese departamento)')
    });
  }

  editar(m: MunicipioDto) {
    this.form = { ...m };
  }

  cancelar() {
    this.form = this.nuevo();
  }

  eliminar(m: MunicipioDto) {
    if (!confirm('¿Eliminar el municipio ' + m.nombre + '?')) return;
    this.servicio.eliminar(m.id!).subscribe({
      next: () => {
        this.mensaje.set('Eliminado correctamente');
        this.cargar();
      },
      error: () => this.mensaje.set('No se pudo eliminar (tiene sucursales o direcciones asociadas)')
    });
  }
}