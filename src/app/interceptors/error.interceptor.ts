import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

/** À mettre à true sur une requête dont l'erreur est affichée directement dans la page. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Traduit une erreur HTTP en message lisible pour l'utilisateur. */
export function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Serveur injoignable. Vérifiez votre connexion ou réessayez dans un instant.';
  }
  const serverMessage = typeof error.error?.message === 'string' ? error.error.message : null;
  if (serverMessage) {
    return serverMessage;
  }
  switch (error.status) {
    case 401: return 'Session expirée, veuillez vous reconnecter.';
    case 403: return 'Accès refusé.';
    case 404: return 'Ressource introuvable.';
    default: return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }
}

/**
 * Gestion centralisée des erreurs HTTP : affiche une notification au lieu de laisser l'erreur
 * silencieuse dans la console. L'erreur est ensuite relancée pour que le composant puisse réagir.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!req.context.get(SKIP_ERROR_TOAST)) {
          this.toastr.error(errorMessage(error), 'Erreur');
        }
        return throwError(() => error);
      })
    );
  }
}
