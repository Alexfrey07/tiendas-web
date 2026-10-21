import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const peticion = token && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: 'Basic ' + token } })
    : req;
  return next(peticion).pipe(
    catchError(err => {
      if (err.status === 401 && token) auth.logout();
      return throwError(() => err);
    })
  );
};