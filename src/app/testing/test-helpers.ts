import { registerLocaleData } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import localeFr from '@angular/common/locales/fr';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { Product } from '../data-interfaces/Product';
import { ShipmentType } from '../data-interfaces/ShipmentType';
import { StatusLabelPipe } from '../shared/shipment-status';

registerLocaleData(localeFr);

/** Module de test commun : HTTP simulé, routeur de test, formulaires, notifications, locale FR. */
export function setupTestBed(declarations: Type<unknown>[] = [], providers: Provider[] = []): void {
  localStorage.clear();
  sessionStorage.clear();
  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      FormsModule,
      ReactiveFormsModule,
      NoopAnimationsModule,
      ToastrModule.forRoot()
    ],
    declarations: [...declarations, StatusLabelPipe],
    providers: [
      { provide: LOCALE_ID, useValue: 'fr-FR' },
      { provide: DEFAULT_CURRENCY_CODE, useValue: 'MAD' },
      ...providers
    ]
  });
}

export function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    code: 'P-001',
    name: 'T-shirt Adidas',
    stock: 3,
    price: 249,
    imageUrl: 'assets/adidas.jpg',
    category: { id: 1, code: '1', name: 'Vêtements & chaussures' },
    ...overrides
  };
}

export const SHIPMENT_TYPES: ShipmentType[] = [
  { id: 1, code: 'S-001', name: 'Livraison express', description: '3 à 4 jours', price: 50 },
  { id: 2, code: 'S-002', name: 'Envoi par la poste', description: '20 à 30 jours', price: 20 }
];
