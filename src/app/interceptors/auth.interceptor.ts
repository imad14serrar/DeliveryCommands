import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../service/auth-service/auth.service';

/**
 * Ajoute le jeton JWT (« Authorization: Bearer … ») aux seules requêtes de l'espace admin.
 * Si le serveur répond 401 (jeton expiré ou invalide), l'admin est déconnecté et redirigé.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly adminUrl = `${environment.apiUrl}/admin`;

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(this.adminUrl)) {
      return next.handle(req);
    }
    const token = this.auth.token;
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.auth.logout();
          this.router.navigate(['/admin/connexion']);
        }
        return throwError(() => error);
      })
    );
  }
}
