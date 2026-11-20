import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Tracking } from '../data-interfaces/Shipment';
import { SHIPMENT_TYPES, setupTestBed } from '../testing/test-helpers';
import { TraficOrdersComponent } from './trafic-orders.component';

describe('TraficOrdersComponent', () => {
  let fixture: ComponentFixture<TraficOrdersComponent>;
  let component: TraficOrdersComponent;
  let http: HttpTestingController;

  const tracking: Tracking = {
    code: 'CMD-1', firstName: 'Sara', city: 'Rabat', orderDate: '2026-11-20T10:00:00',
    updatedAt: '2026-11-21T10:00:00', status: 'SHIPPED', shipmentType: SHIPMENT_TYPES[0], itemCount: 2, total: 548
  };

  beforeEach(() => {
    setupTestBed([TraficOrdersComponent]);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TraficOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('n\'appelle pas l\'API si le code ou l\'e-mail manque', () => {
    component.form.setValue({ code: 'CMD-1', email: '' });
    component.search();
    http.expectNone(() => true);
  });

  it('affiche les étapes atteintes selon le statut', () => {
    component.form.setValue({ code: 'CMD-1', email: 'sara@example.com' });
    component.search();
    http.expectOne(r => r.url === `${environment.apiUrl}/shipments/track`).flush(tracking);
    fixture.detectChanges();

    const reached = fixture.nativeElement.querySelectorAll('.step.reached');
    expect(reached.length).toBe(2); // traitée + expédiée
  });

  it('affiche le message du serveur si la commande est introuvable', () => {
    component.form.setValue({ code: 'CMD-X', email: 'x@example.com' });
    component.search();
    http.expectOne(r => r.url === `${environment.apiUrl}/shipments/track`)
      .flush({ message: 'Aucune commande ne correspond à ce code et cet e-mail.' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aucune commande ne correspond');
  });
});
