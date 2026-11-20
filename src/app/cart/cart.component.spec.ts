import { TestBed } from '@angular/core/testing';
import { CartService } from '../service/cart-service/cart.service';
import { aProduct, setupTestBed } from '../testing/test-helpers';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  beforeEach(() => setupTestBed([CartComponent]));

  it('affiche un message quand le panier est vide', () => {
    const fixture = TestBed.createComponent(CartComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Votre panier est vide');
  });

  it('affiche les articles et met à jour le total quand la quantité change', () => {
    const cart = TestBed.inject(CartService);
    cart.add(aProduct({ price: 100, stock: 5 }));
    const fixture = TestBed.createComponent(CartComponent);
    fixture.detectChanges();

    fixture.componentInstance.increaseQuantity(cart.items[0]);
    fixture.detectChanges();
    expect(cart.items[0].quantity).toBe(2);
    expect(fixture.nativeElement.textContent.replace(/\s/g, '')).toContain('200,00MAD');
  });
});
