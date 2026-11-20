import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DashboardStats } from 'src/app/data-interfaces/Admin';
import { Shipment, ShipmentStatus } from 'src/app/data-interfaces/Shipment';

/** Appels de l'espace administrateur (le jeton est ajouté par AuthInterceptor). */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly adminUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getShipments(status?: ShipmentStatus): Observable<Shipment[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Shipment[]>(`${this.adminUrl}/shipments`, { params });
  }

  updateStatus(code: string, status: ShipmentStatus): Observable<Shipment> {
    return this.http.patch<Shipment>(`${this.adminUrl}/shipments/${encodeURIComponent(code)}/status`, { status });
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.adminUrl}/stats`);
  }
}
