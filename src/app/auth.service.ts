import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface ItemMenu {
  ROL: string;
  ID_MENU: number;
  ID_MENU_PADRE: number | null;
  NOMBRE_OPCION: string;
  URL_PANTALLA: string | null;
  ICONO: string | null;
  ORDEN: number;
  PERMISO_LECTURA: string;
  PERMISO_ESCRITURA: string;
  PERMISO_EDICION: string;
  PERMISO_ELIMINACION: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = 'http://localhost:8080/api/auth/menu';

  token = signal<string | null>(sessionStorage.getItem('token'));
  usuario = signal<string>(sessionStorage.getItem('usuario') ?? '');
  menu = signal<ItemMenu[]>(JSON.parse(sessionStorage.getItem('menu') ?? '[]'));
  logueado = computed(() => this.token() !== null);

  login(usuario: string, clave: string): Observable<ItemMenu[]> {
    const token = btoa(usuario + ':' + clave);
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });
    return this.http.get<ItemMenu[]>(this.url, { headers }).pipe(
      tap(menu => {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('usuario', usuario);
        sessionStorage.setItem('menu', JSON.stringify(menu));
        this.token.set(token);
        this.usuario.set(usuario);
        this.menu.set(menu);
      })
    );
  }


    primeraRuta(): string {
    const items = this.menu();
    const padres = items.filter(p => p.ID_MENU_PADRE == null).sort((a, b) => a.ORDEN - b.ORDEN);
    for (const p of padres) {
      const hijo = items
        .filter(h => h.ID_MENU_PADRE === p.ID_MENU && h.URL_PANTALLA)
        .sort((a, b) => a.ORDEN - b.ORDEN)[0];
      if (hijo) return hijo.URL_PANTALLA!;
    }
    return '';
  }
  
  logout() {
    sessionStorage.clear();
    this.token.set(null);
    this.usuario.set('');
    this.menu.set([]);
    this.router.navigate(['/login']);
  }
}