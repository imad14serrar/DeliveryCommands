import { TestBed } from '@angular/core/testing';
import { aProduct, setupTestBed } from 'src/app/testing/test-helpers';
import { CART_STORAGE_KEY, CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    setupTestBed();
    service = TestBed.inject(CartService);
  });

  it('ajoute un produit avec une quantité de 1', () => {
    expect(service.add(aProduct())).toBe('added');
    expect(service.items.length).toBe(1);
    expect(service.items[0].quantity).toBe(1);
  });

  it('incrémente la quantité si le produit est déjà dans le panier, sans dépasser le stock', () => {
    const product = aProduct({ stock: 2 });
    service.add(product);
    expect(service.add(product)).toBe('incremented');
    expect(service.add(product)).toBe('max-stock');
    expect(service.items[0].quantity).toBe(2);
  });

  it('refuse un produit en rupture de stock', () => {
    expect(service.add(aProduct({ stock: 0 }))).toBe('out-of-stock');
    expect(service.items.length).toBe(0);
  });

  it('borne la quantité entre 1 et le stock', () => {
    service.add(aProduct({ stock: 3 }));
    service.setQuantity(1, 10);
    expect(service.items[0].quantity).toBe(3);
    service.setQuantity(1, -4);
    expect(service.items[0].quantity).toBe(1);
  });

  it('calcule le total et le nombre d\'articles', () => {
    let count = 0;
    service.count$.subscribe(c => (count = c));
    service.add(aProduct({ id: 1, price: 249, stock: 5 }));
    service.add(aProduct({ id: 2, price: 690, stock: 5 }));
    service.setQuantity(1, 2);
    expect(service.total).toBe(2 * 249 + 690);
    expect(count).toBe(3);
  });

  it('sauvegarde le panier dans le localStorage et le recharge (persistance)', () => {
    service.add(aProduct());
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).length).toBe(1);

    const reloaded = new CartService();
    expect(reloaded.items.length).toBe(1);
    expect(reloaded.items[0].product.name).toBe('T-shirt Adidas');
  });

  it('ignore un contenu corrompu dans le localStorage', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{pas du json');
    expect(new CartService().items).toEqual([]);
  });

  it('retire un produit et vide le panier', () => {
    service.add(aProduct({ id: 1 }));
    service.add(aProduct({ id: 2 }));
    service.remove(1);
    expect(service.items.map(i => i.product.id)).toEqual([2]);
    service.clear();
    expect(service.items).toEqual([]);
  });
});
