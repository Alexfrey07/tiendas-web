import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeguridadService, RolFila, PermisoFila } from '../seguridad.service';

@Component({
  selector: 'app-roles',
  imports: [FormsModule],
  templateUrl: './roles.html'
})
export class Roles {
  private servicio = inject(SeguridadService);

  lista = signal<RolFila[]>([]);
  seleccionado = signal<RolFila | null>(null);
  permisos = signal<PermisoFila[]>([]);
  mensaje = signal('');
  esError = signal(false);

  nombre = '';
  descripcion = '';

  constructor() {
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
    this.servicio.roles().subscribe({
      next: d => this.lista.set(d),
      error: e => this.fallo(e)
    });
  }

  esAdmin(): boolean {
    return this.seleccionado()?.nombre === 'ADMINISTRADOR';
  }

  crear() {
    if (!this.nombre.trim()) {
      this.esError.set(true);
      this.mensaje.set('El nombre del rol es obligatorio');
      return;
    }
    this.servicio.crearRol({ nombre: this.nombre, descripcion: this.descripcion }).subscribe({
      next: () => {
        this.nombre = '';
        this.descripcion = '';
        this.ok('Rol creado. Seleccione "Permisos" para asignarle pantallas.');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  eliminar(r: RolFila) {
    if (!confirm('¿Eliminar el rol ' + r.nombre + '?')) return;
    this.servicio.eliminarRol(r.id).subscribe({
      next: () => {
        if (this.seleccionado()?.id === r.id) {
          this.seleccionado.set(null);
          this.permisos.set([]);
        }
        this.ok('Rol eliminado');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  elegir(r: RolFila) {
    this.seleccionado.set(r);
    this.servicio.permisos(r.id).subscribe({
      next: d => this.permisos.set(d),
      error: e => this.fallo(e)
    });
  }

  cambiar(p: PermisoFila, campo: 'lectura' | 'escritura' | 'edicion' | 'eliminacion', marcado: boolean) {
    p[campo] = marcado ? 'S' : 'N';
    if (marcado && campo !== 'lectura') p.lectura = 'S';
    if (!marcado && campo === 'lectura') {
      p.escritura = 'N';
      p.edicion = 'N';
      p.eliminacion = 'N';
    }
    this.permisos.update(l => [...l]);
  }

  guardar() {
    const r = this.seleccionado();
    if (!r) return;
    this.servicio.guardarPermisos(r.id, this.permisos()).subscribe({
      next: () => this.ok('Permisos de ' + r.nombre + ' guardados. Los usuarios con este rol deben volver a iniciar sesión para ver su menú nuevo.'),
      error: e => this.fallo(e)
    });
  }
}