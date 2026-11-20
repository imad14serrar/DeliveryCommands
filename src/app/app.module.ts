import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CartComponent } from './cart/cart.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { NavbarComponent } from './navbar/navbar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { PaimentOnlineComponent } from './paiment-online/paiment-online.component';
import { ProductListComponent } from './product-list/product-list.component';
import { StatusLabelPipe } from './shared/shipment-status';
import { ShipmentPageComponent } from './shipment-page/shipment-page.component';
import { TraficOrdersComponent } from './trafic-orders/trafic-orders.component';

// Formats français : 1 238,00 MAD, dates « 20/11/2026 »…
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    NavbarComponent,
    CartComponent,
    ContactUsComponent,
    PaimentOnlineComponent,
    TraficOrdersComponent,
    ShipmentPageComponent,
    OrderConfirmationComponent,
    NotFoundComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    StatusLabelPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right', timeOut: 3000, preventDuplicates: true })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'MAD' },
    // Ordre d'exécution : chargement → jeton admin → gestion des erreurs.
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
