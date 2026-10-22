import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioFila {
  id: number;
  username: string;
  empleado: string;
  idRol: number;
  rol: string;
  estado: string;
}

export interface Opcion {
  id: number;
  nombre: string;
}

export interface RolFila {
  id: number;
  nombre: string;
  descripcion: string | null;
  usuarios: number;
}

export interface PermisoFila {
  idMenu: number;
  grupo: string;
  opcion: string;
  lectura: string;
  escritura: string;
  edicion: string;
  eliminacion: string;
}

export interface BitacoraFila {
  id: number;
  fecha: string;
  tabla: string;
  campo: string;
  llave: string;
  tipo: string;
  anterior: string | null;
  nuevo: string | null;
  usuario: string;
  ip: string | null;
  equipo: string | null;
}

@Injectable({ providedIn: 'root' })
export class SeguridadService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api';

  usuarios(): Observable<UsuarioFila[]> {
    return this.http.get<UsuarioFila[]>(`${this.base}/usuarios`);
  }

  empleadosLibres(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${this.base}/usuarios/empleados-libres`);
  }

  rolesOpciones(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${this.base}/usuarios/roles`);
  }

  crearUsuario(d: { idEmpleado: number; idRol: number; username: string; password: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/usuarios`, d);
  }

  actualizarUsuario(id: number, d: { idRol: number; estado: string }): Observable<void> {
    return this.http.put<void>(`${this.base}/usuarios/${id}`, d);
  }

  cambiarClave(id: number, password: string): Observable<void> {
    return this.http.put<void>(`${this.base}/usuarios/${id}/clave`, { password });
  }

  roles(): Observable<RolFila[]> {
    return this.http.get<RolFila[]>(`${this.base}/roles`);
  }

  crearRol(d: { nombre: string; descripcion: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/roles`, d);
  }

  eliminarRol(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/roles/${id}`);
  }

  permisos(idRol: number): Observable<PermisoFila[]> {
    return this.http.get<PermisoFila[]>(`${this.base}/roles/${idRol}/permisos`);
  }

  guardarPermisos(idRol: number, items: PermisoFila[]): Observable<void> {
    const cuerpo = items.map(p => ({
      idMenu: p.idMenu, lectura: p.lectura, escritura: p.escritura, edicion: p.edicion, eliminacion: p.eliminacion
    }));
    return this.http.put<void>(`${this.base}/roles/${idRol}/permisos`, cuerpo);
  }

  bitacora(tabla: string, tipo: string): Observable<BitacoraFila[]> {
    let params = new HttpParams();
    if (tabla) params = params.set('tabla', tabla);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<BitacoraFila[]>(`${this.base}/bitacora`, { params });
  }

  tablasBitacora(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/bitacora/tablas`);
  }
}