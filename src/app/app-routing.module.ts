import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { CartComponent } from './cart/cart.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { adminGuard, cartNotEmptyGuard, shippingInfoGuard } from './guards/guards';
import { NotFoundComponent } from './not-found/not-found.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { PaimentOnlineComponent } from './paiment-online/paiment-online.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ShipmentPageComponent } from './shipment-page/shipment-page.component';
import { TraficOrdersComponent } from './trafic-orders/trafic-orders.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'produits' },
  { path: 'produits', component: ProductListComponent, title: 'Boutique' },
  { path: 'panier', component: CartComponent, title: 'Mon panier' },
  { path: 'livraison', component: ShipmentPageComponent, canActivate: [cartNotEmptyGuard], title: 'Livraison' },
  {
    path: 'paiement',
    component: PaimentOnlineComponent,
    canActivate: [cartNotEmptyGuard, shippingInfoGuard],
    title: 'Paiement'
  },
  { path: 'confirmation/:code', component: OrderConfirmationComponent, title: 'Commande confirmée' },
  { path: 'suivi', component: TraficOrdersComponent, title: 'Suivi de commande' },
  { path: 'contact', component: ContactUsComponent, title: 'Contact' },
  { path: 'admin/connexion', component: AdminLoginComponent, title: 'Connexion admin' },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'Tableau de bord' },
  { path: '**', component: NotFoundComponent, title: 'Page introuvable' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
