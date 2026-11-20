import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../service/auth-service/auth.service';
import { CartService } from '../service/cart-service/cart.service';
import { LoadingService } from '../service/loading-service/loading.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  readonly shopName = environment.shopName;
  /** Nombre total d'articles du panier, mis à jour automatiquement (badge). */
  readonly cartCount$ = this.cart.count$;
  readonly loading$ = this.loading.loading$;

  constructor(private cart: CartService, private loading: LoadingService, public auth: AuthService) {}
}
