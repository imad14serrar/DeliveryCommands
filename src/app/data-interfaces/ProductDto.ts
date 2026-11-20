/** Ligne de commande envoyée au serveur : seulement l'identifiant et la quantité (les prix sont calculés côté serveur). */
export interface ProductDto {
  productId: number;
  quantity: number;
}
