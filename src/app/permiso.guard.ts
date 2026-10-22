import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permisoGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.logueado()) return router.createUrlTree(['/login']);
    const url = state.url.split('?')[0];
    const permitido = auth.menu().some(m => m.URL_PANTALLA === url);
    return permitido ? true : router.createUrlTree(['/login']);
};