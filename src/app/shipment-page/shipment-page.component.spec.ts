import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CartService } from '../service/cart-service/cart.service';
import { CheckoutService } from '../service/checkout-service/checkout.service';
import { SHIPMENT_TYPES, aProduct, setupTestBed } from '../testing/test-helpers';
import { ShipmentPageComponent } from './shipment-page.component';

describe('ShipmentPageComponent', () => {
  let fixture: ComponentFixture<ShipmentPageComponent>;
  let component: ShipmentPageComponent;
  let router: Router;

  beforeEach(() => {
    setupTestBed([ShipmentPageComponent]);
    TestBed.inject(CartService).add(aProduct({ price: 249 }));
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture = TestBed.createComponent(ShipmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/shipment-types`).flush(SHIPMENT_TYPES);
    fixture.detectChanges();
  });

  it('présélectionne le premier mode de livraison avec SON prix (bug « 14 » corrigé)', () => {
    expect(component.form.controls.shipmentTypeCode.value).toBe('S-001');
    expect(component.shippingCost).toBe(50);
    expect(component.total).toBe(299);
  });

  it('met à jour le total quand on change de mode de livraison', () => {
    component.form.controls.shipmentTypeCode.setValue('S-002');
    expect(component.total).toBe(269);
  });

  it('n\'avance pas si le formulaire est invalide et affiche les erreurs', () => {
    component.submit();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBeGreaterThan(0);
  });

  it('enregistre les informations et passe au paiement si le formulaire est valide', () => {
    component.form.patchValue({
      firstName: 'Sara', lastName: 'Test', phone: '0612345678', email: 'sara@example.com',
      address: '12 rue des Tests', city: 'Marrakech', postalCode: '40000'
    });
    component.submit();
    expect(TestBed.inject(CheckoutService).shipping?.city).toBe('Marrakech');
    expect(router.navigate).toHaveBeenCalledWith(['/paiement']);
  });
});
