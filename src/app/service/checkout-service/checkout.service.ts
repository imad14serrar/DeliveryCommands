import { Injectable } from '@angular/core';
import { CreateShipmentRequest, ShippingInfo } from 'src/app/data-interfaces/Shipment';
import { ShipmentType } from 'src/app/data-interfaces/ShipmentType';
import { CartService } from '../cart-service/cart.service';

export const CHECKOUT_STORAGE_KEY = 'deliverycommands.checkout';

interface CheckoutState {
  shipping: ShippingInfo;
  shipmentType: ShipmentType;
}

/**
 * État du tunnel de commande (panier → livraison → paiement).
 * Remplace l'ancien objet mutable `bodyToSend` et le passage par `history.state` :
 * les informations de livraison sont conservées dans le sessionStorage, ce qui permet
 * de revenir en arrière ou d'actualiser la page sans tout perdre.
 */
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private state: CheckoutState | null = this.load();

  constructor(private cart: CartService) {}

  get shipping(): ShippingInfo | null {
    return this.state?.shipping ?? null;
  }

  get shipmentType(): ShipmentType | null {
    return this.state?.shipmentType ?? null;
  }

  get hasShippingInfo(): boolean {
    return this.state !== null;
  }

  get shippingCost(): number {
    return this.state?.shipmentType.price ?? 0;
  }

  get grandTotal(): number {
    return this.cart.total + this.shippingCost;
  }

  saveShipping(shipping: ShippingInfo, shipmentType: ShipmentType): void {
    this.state = { shipping, shipmentType };
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(this.state));
  }

  /** Construit la requête envoyée au serveur à partir du panier et des infos de livraison. */
  buildRequest(): CreateShipmentRequest {
    if (!this.state) {
      throw new Error('Informations de livraison manquantes');
    }
    return {
      ...this.state.shipping,
      items: this.cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
    };
  }

  reset(): void {
    this.state = null;
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }

  private load(): CheckoutState | null {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
