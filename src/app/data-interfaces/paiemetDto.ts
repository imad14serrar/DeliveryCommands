/** Récapitulatif financier d'une commande, calculé par le serveur (paiement simulé). */
export interface PaiementDto {
  method: string;
  productsTotal: number;
  shipmentPrice: number;
  discountValue: number;
  total: number;
}
