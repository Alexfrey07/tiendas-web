import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  usuario = '';
  clave = '';
  error = signal('');

  constructor() {
    if (this.auth.logueado()) this.irAlInicio();
  }

  private irAlInicio() {
    const ruta = this.auth.primeraRuta();
    if (ruta) this.router.navigate([ruta]);
  }

  entrar() {
    this.auth.login(this.usuario, this.clave).subscribe({
      next: () => this.irAlInicio(),
      error: () => this.error.set('Usuario o clave incorrectos')
    });
  }
}