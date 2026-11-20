import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginResponse } from 'src/app/data-interfaces/Admin';
import { SKIP_ERROR_TOAST } from 'src/app/interceptors/error.interceptor';

export const AUTH_STORAGE_KEY = 'deliverycommands.auth';

/** Connexion de l'administrateur : stocke le jeton JWT et sa date d'expiration. */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true)
      })
      .pipe(tap(session => localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))));
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  get session(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Jeton valide uniquement s'il existe et n'est pas expiré. */
  get token(): string | null {
    const session = this.session;
    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return session.token;
  }

  get isLoggedIn(): boolean {
    return this.token !== null;
  }
}
