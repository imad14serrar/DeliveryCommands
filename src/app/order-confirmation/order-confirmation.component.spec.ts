import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { setupTestBed } from '../testing/test-helpers';
import { OrderConfirmationComponent } from './order-confirmation.component';

describe('OrderConfirmationComponent', () => {
  beforeEach(() => setupTestBed([OrderConfirmationComponent], [
    { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ code: 'CMD-20261120-ABCDEF' }) } } }
  ]));

  it('affiche le code de suivi de la commande', () => {
    const fixture = TestBed.createComponent(OrderConfirmationComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CMD-20261120-ABCDEF');
  });
});
