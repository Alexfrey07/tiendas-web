import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeguridadService, UsuarioFila, Opcion } from '../seguridad.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html'
})
export class Usuarios {
  private servicio = inject(SeguridadService);
  auth = inject(AuthService);

  lista = signal<UsuarioFila[]>([]);
  empleados = signal<Opcion[]>([]);
  roles = signal<Opcion[]>([]);
  mensaje = signal('');
  esError = signal(false);

  idEmpleado: number | null = null;
  idRol: number | null = null;
  username = '';
  password = '';

  editando = signal<UsuarioFila | null>(null);
  editRol: number | null = null;
  editEstado = 'ACTIVO';

  claveDe = signal<UsuarioFila | null>(null);
  nuevaClave = '';

  constructor() {
    this.servicio.rolesOpciones().subscribe(d => this.roles.set(d));
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
    this.servicio.usuarios().subscribe({
      next: d => this.lista.set(d),
      error: e => this.fallo(e)
    });
    this.servicio.empleadosLibres().subscribe({
      next: d => this.empleados.set(d),
      error: e => this.fallo(e)
    });
  }

  crear() {
    if (!this.idEmpleado || !this.idRol || !this.username.trim()) {
      this.esError.set(true);
      this.mensaje.set('El empleado, el rol y el usuario son obligatorios');
      return;
    }
    if (this.password.length < 8) {
      this.esError.set(true);
      this.mensaje.set('La clave debe tener al menos 8 caracteres');
      return;
    }
    this.servicio.crearUsuario({
      idEmpleado: this.idEmpleado, idRol: this.idRol, username: this.username, password: this.password
    }).subscribe({
      next: () => {
        this.idEmpleado = null;
        this.idRol = null;
        this.username = '';
        this.password = '';
        this.ok('Usuario creado correctamente');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  abrirEdicion(u: UsuarioFila) {
    this.claveDe.set(null);
    this.editando.set(u);
    this.editRol = u.idRol;
    this.editEstado = u.estado;
  }

  guardarEdicion() {
    const u = this.editando();
    if (!u || !this.editRol) return;
    this.servicio.actualizarUsuario(u.id, { idRol: this.editRol, estado: this.editEstado }).subscribe({
      next: () => {
        this.editando.set(null);
        this.ok('Usuario actualizado');
        this.cargar();
      },
      error: e => this.fallo(e)
    });
  }

  abrirClave(u: UsuarioFila) {
    this.editando.set(null);
    this.claveDe.set(u);
    this.nuevaClave = '';
  }

  guardarClave() {
    const u = this.claveDe();
    if (!u) return;
    if (this.nuevaClave.length < 8) {
      this.esError.set(true);
      this.mensaje.set('La clave debe tener al menos 8 caracteres');
      return;
    }
    this.servicio.cambiarClave(u.id, this.nuevaClave).subscribe({
      next: () => {
        this.claveDe.set(null);
        this.ok('Clave de ' + u.username + ' actualizada');
      },
      error: e => this.fallo(e)
    });
  }
}