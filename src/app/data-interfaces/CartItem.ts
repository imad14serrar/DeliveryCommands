import { Product } from './Product';

/** Ligne du panier : le produit et la quantité choisie (distincte du stock du produit). */
export interface CartItem {
  product: Product;
  quantity: number;
}
