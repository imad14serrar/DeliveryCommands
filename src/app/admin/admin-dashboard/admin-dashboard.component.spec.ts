import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Shipment } from 'src/app/data-interfaces/Shipment';
import { SHIPMENT_TYPES, setupTestBed } from 'src/app/testing/test-helpers';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let http: HttpTestingController;

  const shipment: Shipment = {
    code: 'CMD-1', firstName: 'Sara', lastName: 'Test', phone: '0612345678', email: 'sara@example.com',
    address: '12 rue', city: 'Rabat', postalCode: '10000', orderDate: '2026-11-20T10:00:00',
    updatedAt: '2026-11-20T10:00:00', status: 'PROCESSED', shipmentType: SHIPMENT_TYPES[0], items: [],
    payment: { method: 'CARTE_SIMULEE', productsTotal: 249, shipmentPrice: 50, discountValue: 0, total: 299 }
  };
  const stats = {
    totalOrders: 1, totalRevenue: 299, productCount: 10, lowStockProducts: [],
    ordersByStatus: { PROCESSED: 1, SHIPPED: 0, ON_THE_WAY: 0, DELIVERED: 0 }
  };

  beforeEach(() => {
    setupTestBed([AdminDashboardComponent]);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/admin/stats`).flush(stats);
    http.expectOne(`${environment.apiUrl}/admin/shipments`).flush([shipment]);
    fixture.detectChanges();
  });

  it('affiche les indicateurs et la liste des commandes', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('CMD-1');
    expect(fixture.componentInstance.pendingOrders).toBe(1);
  });

  it('envoie le nouveau statut au serveur', () => {
    const component = fixture.componentInstance;
    component.changeStatus(component.shipments[0], 'SHIPPED');
    const req = http.expectOne(`${environment.apiUrl}/admin/shipments/CMD-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'SHIPPED' });
    req.flush({ ...shipment, status: 'SHIPPED' });
    http.expectOne(`${environment.apiUrl}/admin/stats`).flush(stats);
    expect(component.shipments[0].status).toBe('SHIPPED');
  });

  it('recherche localement par nom ou ville', () => {
    const component = fixture.componentInstance;
    component.search = 'rabat';
    expect(component.visibleShipments.length).toBe(1);
    component.search = 'casablanca';
    expect(component.visibleShipments.length).toBe(0);
  });
});
