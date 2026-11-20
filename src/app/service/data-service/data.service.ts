import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from 'src/app/data-interfaces/Category';
import { Product } from 'src/app/data-interfaces/Product';
import { CreateShipmentRequest, Shipment, Tracking } from 'src/app/data-interfaces/Shipment';
import { ShipmentType } from 'src/app/data-interfaces/ShipmentType';
import { SKIP_ERROR_TOAST } from 'src/app/interceptors/error.interceptor';

/** Appels HTTP publics vers l'API (catalogue, création et suivi de commande). */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getShipmentTypes(): Observable<ShipmentType[]> {
    return this.http.get<ShipmentType[]>(`${this.apiUrl}/shipment-types`);
  }

  createShipment(request: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.apiUrl}/shipments`, request);
  }

  /** Le message « introuvable » est affiché dans la page, d'où SKIP_ERROR_TOAST. */
  trackShipment(code: string, email: string): Observable<Tracking> {
    const params = new HttpParams().set('code', code).set('email', email);
    return this.http.get<Tracking>(`${this.apiUrl}/shipments/track`, {
      params,
      context: new HttpContext().set(SKIP_ERROR_TOAST, true)
    });
  }
}
