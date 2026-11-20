import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from 'src/app/data-interfaces/CartItem';
import { Product } from 'src/app/data-interfaces/Product';

export const CART_STORAGE_KEY = 'deliverycommands.cart';

/** Résultat d'un ajout au panier, pour afficher le bon message. */
export type AddToCartResult = 'added' | 'incremented' | 'max-stock' | 'out-of-stock';

/**
 * Panier réactif et persistant.
 * - L'état est un BehaviorSubject : les composants (navbar, page panier…) s'abonnent à items$ / count$ / total$
 *   et se mettent à jour automatiquement.
 * - Chaque modification est sauvegardée dans le localStorage : le panier survit à l'actualisation de la page.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.load());

  readonly items$ = this.itemsSubject.asObservable();
  readonly count$ = this.items$.pipe(map(items => items.reduce((sum, i) => sum + i.quantity, 0)));
  readonly total$ = this.items$.pipe(map(items => CartService.computeTotal(items)));

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  get total(): number {
    return CartService.computeTotal(this.items);
  }

  add(product: Product): AddToCartResult {
    if (product.stock <= 0) {
      return 'out-of-stock';
    }
    const existing = this.items.find(i => i.product.id === product.id);
    if (!existing) {
      this.save([...this.items, { product, quantity: 1 }]);
      return 'added';
    }
    if (existing.quantity >= product.stock) {
      return 'max-stock';
    }
    this.setQuantity(product.id, existing.quantity + 1);
    return 'incremented';
  }

  /** Fixe la quantité d'un produit, bornée entre 1 et le stock disponible. */
  setQuantity(productId: number, quantity: number): void {
    this.save(this.items.map(item => {
      if (item.product.id !== productId) {
        return item;
      }
      const safe = Math.min(Math.max(Math.floor(quantity) || 1, 1), item.product.stock);
      return { ...item, quantity: safe };
    }));
  }

  remove(productId: number): void {
    this.save(this.items.filter(i => i.product.id !== productId));
  }

  clear(): void {
    this.save([]);
  }

  static computeTotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(i => i?.product?.id && i.quantity > 0) : [];
    } catch {
      return []; // contenu corrompu : on repart d'un panier vide
    }
  }
}
