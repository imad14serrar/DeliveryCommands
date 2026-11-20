import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CartService } from '../service/cart-service/cart.service';
import { CheckoutService } from '../service/checkout-service/checkout.service';
import { SHIPMENT_TYPES, aProduct, setupTestBed } from '../testing/test-helpers';
import { PaimentOnlineComponent } from './paiment-online.component';

describe('PaimentOnlineComponent', () => {
  let fixture: ComponentFixture<PaimentOnlineComponent>;
  let component: PaimentOnlineComponent;
  let http: HttpTestingController;
  let router: Router;
  let cart: CartService;

  const validCard = { cardOwner: 'Sara Test', cardNumber: '4111111111111111', expMonth: '12', expYear: '99', cvv: '123' };

  beforeEach(() => {
    setupTestBed([PaimentOnlineComponent]);
    cart = TestBed.inject(CartService);
    cart.add(aProduct());
    TestBed.inject(CheckoutService).saveShipping({
      firstName: 'Sara', lastName: 'Test', phone: '0612345678', email: 'sara@example.com',
      address: '12 rue des Tests', city: 'Marrakech', postalCode: '40000', shipmentTypeCode: 'S-001'
    }, SHIPMENT_TYPES[0]);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PaimentOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('refuse un numéro de carte qui ne respecte pas l\'algorithme de Luhn', () => {
    component.paymentForm.setValue({ ...validCard, cardNumber: '4111111111111112' });
    expect(component.paymentForm.controls.cardNumber.hasError('luhn')).toBeTrue();
    component.submitPayment();
    http.expectNone(`${environment.apiUrl}/shipments`);
  });

  it('attend la réponse du serveur, vide le panier puis affiche la confirmation', () => {
    component.paymentForm.setValue(validCard);
    component.submitPayment();
    expect(component.pendingPayment).toBeTrue();
    expect(cart.items.length).toBe(1); // rien n'est vidé avant la réponse

    const req = http.expectOne(`${environment.apiUrl}/shipments`);
    expect(req.request.body.cardNumber).toBeUndefined(); // aucune donnée de carte n'est envoyée
    req.flush({ code: 'CMD-20261120-ABCDEF' });

    expect(cart.items.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/confirmation', 'CMD-20261120-ABCDEF'], jasmine.any(Object));
  });

  it('garde le panier et permet de réessayer si le serveur refuse la commande', () => {
    component.paymentForm.setValue(validCard);
    component.submitPayment();
    http.expectOne(`${environment.apiUrl}/shipments`)
      .flush({ message: 'Stock insuffisant' }, { status: 400, statusText: 'Bad Request' });

    expect(component.pendingPayment).toBeFalse();
    expect(cart.items.length).toBe(1);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
