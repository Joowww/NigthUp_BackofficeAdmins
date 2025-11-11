import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone the request and add the authorization header
  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }) : req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from api
        authService.logout();
        location.reload();
      }
      return throwError(() => error);
    })
  );
};