import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/service/auth-service/auth.service';
import { setupTestBed } from 'src/app/testing/test-helpers';
import { AdminLoginComponent } from './admin-login.component';

describe('AdminLoginComponent', () => {
  beforeEach(() => setupTestBed([AdminLoginComponent]));

  it('connecte l\'admin puis redirige vers le tableau de bord', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ username: 'admin', password: 'secret' });
    fixture.componentInstance.submit();

    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/login`).flush({
      token: 'jwt', username: 'admin', expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    expect(TestBed.inject(AuthService).isLoggedIn).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('affiche l\'erreur si les identifiants sont faux', () => {
    const fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ username: 'admin', password: 'faux' });
    fixture.componentInstance.submit();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ message: 'Identifiant ou mot de passe incorrect.' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Identifiant ou mot de passe incorrect.');
  });
});
