import { Component } from '@angular/core';
import { CartItem } from '../data-interfaces/CartItem';
import { CartService } from '../service/cart-service/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  /** Le template s'abonne au panier : tout changement (quantité, suppression) met la page à jour. */
  readonly items$ = this.cartService.items$;
  readonly total$ = this.cartService.total$;

  constructor(private cartService: CartService) {}

  increaseQuantity(item: CartItem): void {
    this.cartService.setQuantity(item.product.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.setQuantity(item.product.id, item.quantity - 1);
  }

  /** Saisie manuelle : la quantité est bornée entre 1 et le stock par le service. */
  onQuantityInput(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cartService.setQuantity(item.product.id, Number(input.value));
    input.value = String(this.cartService.items.find(i => i.product.id === item.product.id)?.quantity ?? 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.remove(item.product.id);
  }

  trackByProduct(_: number, item: CartItem): number {
    return item.product.id;
  }
}
