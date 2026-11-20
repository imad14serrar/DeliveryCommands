import { Category } from './Category';

/** Produit du catalogue. `stock` = quantité disponible en magasin. */
export interface Product {
  id: number;
  code: string;
  name: string;
  stock: number;
  price: number;
  imageUrl: string;
  category: Category;
}
