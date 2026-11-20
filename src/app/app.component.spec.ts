import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { setupTestBed } from './testing/test-helpers';

describe('AppComponent', () => {
  beforeEach(() => setupTestBed([AppComponent, NavbarComponent]));

  it('affiche la barre de navigation et la zone de routage', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-navbar')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });
});
