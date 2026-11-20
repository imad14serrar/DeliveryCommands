import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { setupTestBed } from 'src/app/testing/test-helpers';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    setupTestBed();
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('utilise l\'URL de l\'API définie dans l\'environnement', () => {
    service.getProducts().subscribe();
    http.expectOne(`${environment.apiUrl}/products`).flush([]);
  });

  it('envoie la commande en POST sur /shipments', () => {
    service.createShipment({
      firstName: 'A', lastName: 'B', phone: '0612345678', email: 'a@b.ma', address: 'x', city: 'Rabat',
      postalCode: '10000', shipmentTypeCode: 'S-001', items: [{ productId: 1, quantity: 1 }]
    }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/shipments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.items).toEqual([{ productId: 1, quantity: 1 }]);
    req.flush({});
  });

  it('suit une commande avec le code et l\'e-mail en paramètres', () => {
    service.trackShipment('CMD-1', 'a@b.ma').subscribe();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/shipments/track`);
    expect(req.request.params.get('code')).toBe('CMD-1');
    expect(req.request.params.get('email')).toBe('a@b.ma');
    req.flush({});
  });
});
