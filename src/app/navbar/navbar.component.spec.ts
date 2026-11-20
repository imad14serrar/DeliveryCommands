import { TestBed } from '@angular/core/testing';
import { CartService } from '../service/cart-service/cart.service';
import { aProduct, setupTestBed } from '../testing/test-helpers';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  beforeEach(() => setupTestBed([NavbarComponent]));

  it('affiche le nombre d\'articles du panier dans le badge, mis à jour en direct', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const badge = () => (fixture.nativeElement as HTMLElement).querySelector('.cart-badge');
    expect(badge()).toBeNull(); // panier vide : pas de badge

    const cart = TestBed.inject(CartService);
    cart.add(aProduct({ id: 1, stock: 5 }));
    cart.add(aProduct({ id: 1, stock: 5 }));
    fixture.detectChanges();
    expect(badge()?.textContent?.trim()).toBe('2');
  });
});
