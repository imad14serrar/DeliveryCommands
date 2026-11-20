import { HTTP_INTERCEPTORS, HttpClient, HttpContext } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AUTH_STORAGE_KEY, AuthService } from '../service/auth-service/auth.service';
import { setupTestBed } from '../testing/test-helpers';
import { AuthInterceptor } from './auth.interceptor';
import { ErrorInterceptor, SKIP_ERROR_TOAST } from './error.interceptor';

describe('Intercepteurs HTTP', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let toastr: ToastrService;

  beforeEach(() => {
    setupTestBed([], [
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ]);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    toastr = TestBed.inject(ToastrService);
    spyOn(toastr, 'error');
  });

  afterEach(() => backend.verify());

  function login(expiresInMs: number): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: 'jwt-123', username: 'admin', expiresAt: new Date(Date.now() + expiresInMs).toISOString()
    }));
  }

  it('affiche le message d\'erreur renvoyé par le serveur', () => {
    http.get(`${environment.apiUrl}/products`).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.apiUrl}/products`)
      .flush({ message: 'Stock insuffisant' }, { status: 400, statusText: 'Bad Request' });
    expect(toastr.error).toHaveBeenCalledWith('Stock insuffisant', 'Erreur');
  });

  it('affiche « serveur injoignable » si l\'API ne répond pas', () => {
    http.get(`${environment.apiUrl}/products`).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.apiUrl}/products`).error(new ProgressEvent('error'), { status: 0 });
    expect((toastr.error as jasmine.Spy).calls.mostRecent().args[0]).toContain('Serveur injoignable');
  });

  it('n\'affiche pas de notification si la requête demande SKIP_ERROR_TOAST', () => {
    http.get(`${environment.apiUrl}/x`, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .subscribe({ error: () => undefined });
    backend.expectOne(`${environment.apiUrl}/x`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it('ajoute le jeton uniquement aux requêtes admin', () => {
    login(60_000);
    http.get(`${environment.apiUrl}/admin/stats`).subscribe();
    http.get(`${environment.apiUrl}/products`).subscribe();
    expect(backend.expectOne(`${environment.apiUrl}/admin/stats`).request.headers.get('Authorization')).toBe('Bearer jwt-123');
    expect(backend.expectOne(`${environment.apiUrl}/products`).request.headers.has('Authorization')).toBeFalse();
  });

  it('déconnecte et redirige l\'admin si le serveur répond 401', () => {
    login(60_000);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    http.get(`${environment.apiUrl}/admin/stats`).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.apiUrl}/admin/stats`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(AuthService).isLoggedIn).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/connexion']);
  });

  it('considère un jeton expiré comme absent', () => {
    login(-1000);
    expect(TestBed.inject(AuthService).token).toBeNull();
  });
});
