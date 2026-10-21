import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  auth = inject(AuthService);

  menu = computed(() => {
    const items = this.auth.menu();
    return items
      .filter(p => p.ID_MENU_PADRE == null)
      .sort((a, b) => a.ORDEN - b.ORDEN)
      .map(p => ({
        id: p.ID_MENU,
        nombre: p.NOMBRE_OPCION,
        hijos: items
          .filter(h => h.ID_MENU_PADRE === p.ID_MENU)
          .sort((a, b) => a.ORDEN - b.ORDEN)
          .map(h => ({ id: h.ID_MENU, nombre: h.NOMBRE_OPCION, url: h.URL_PANTALLA }))
      }));
  });
}