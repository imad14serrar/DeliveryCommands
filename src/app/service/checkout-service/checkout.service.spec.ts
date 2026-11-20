import { TestBed } from '@angular/core/testing';
import { ShippingInfo } from 'src/app/data-interfaces/Shipment';
import { SHIPMENT_TYPES, aProduct, setupTestBed } from 'src/app/testing/test-helpers';
import { CartService } from '../cart-service/cart.service';
import { CHECKOUT_STORAGE_KEY, CheckoutService } from './checkout.service';

const SHIPPING: ShippingInfo = {
  firstName: 'Sara', lastName: 'Test', phone: '0612345678', email: 'sara@example.com',
  address: '12 rue des Tests', city: 'Marrakech', postalCode: '40000', shipmentTypeCode: 'S-001'
};

describe('CheckoutService', () => {
  let checkout: CheckoutService;
  let cart: CartService;

  beforeEach(() => {
    setupTestBed();
    checkout = TestBed.inject(CheckoutService);
    cart = TestBed.inject(CartService);
  });

  it('construit la requête avec seulement les id et quantités des produits', () => {
    cart.add(aProduct({ id: 7, stock: 5 }));
    cart.setQuantity(7, 2);
    checkout.saveShipping(SHIPPING, SHIPMENT_TYPES[0]);

    expect(checkout.buildRequest()).toEqual({ ...SHIPPING, items: [{ productId: 7, quantity: 2 }] });
  });

  it('calcule le total avec les frais de livraison choisis', () => {
    cart.add(aProduct({ price: 249 }));
    checkout.saveShipping(SHIPPING, SHIPMENT_TYPES[0]);
    expect(checkout.shippingCost).toBe(50);
    expect(checkout.grandTotal).toBe(299);
  });

  it('conserve les informations dans le sessionStorage et les efface au reset', () => {
    checkout.saveShipping(SHIPPING, SHIPMENT_TYPES[1]);
    expect(new CheckoutService(cart).shipping).toEqual(SHIPPING);

    checkout.reset();
    expect(checkout.hasShippingInfo).toBeFalse();
    expect(sessionStorage.getItem(CHECKOUT_STORAGE_KEY)).toBeNull();
  });

  it('refuse de construire une requête sans informations de livraison', () => {
    expect(() => checkout.buildRequest()).toThrowError();
  });
});
