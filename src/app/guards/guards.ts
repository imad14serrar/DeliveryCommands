import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service/auth.service';
import { CartService } from '../service/cart-service/cart.service';
import { CheckoutService } from '../service/checkout-service/checkout.service';

/** Livraison et paiement : impossible d'y accéder avec un panier vide. */
export const cartNotEmptyGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  return cart.items.length > 0 ? true : inject(Router).createUrlTree(['/panier']);
};

/** Paiement : il faut d'abord avoir rempli les informations de livraison. */
export const shippingInfoGuard: CanActivateFn = () => {
  const checkout = inject(CheckoutService);
  return checkout.hasShippingInfo ? true : inject(Router).createUrlTree(['/livraison']);
};

/** Espace admin : réservé à un administrateur connecté (jeton valide). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn ? true : inject(Router).createUrlTree(['/admin/connexion']);
};
