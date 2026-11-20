import { PaiementDto } from './paiemetDto';
import { ProductDto } from './ProductDto';
import { ShipmentType } from './ShipmentType';

/** Étapes d'une commande, dans l'ordre (identiques à l'enum Java ShipmentStatus). */
export type ShipmentStatus = 'PROCESSED' | 'SHIPPED' | 'ON_THE_WAY' | 'DELIVERED';

/** Informations de livraison saisies par le client. */
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  shipmentTypeCode: string;
}

/** Corps de la requête POST /api/shipments. */
export interface CreateShipmentRequest extends ShippingInfo {
  items: ProductDto[];
}

export interface ShipmentItem {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Commande complète (confirmation et espace admin). */
export interface Shipment {
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  orderDate: string;
  updatedAt: string;
  status: ShipmentStatus;
  shipmentType: ShipmentType;
  items: ShipmentItem[];
  payment: PaiementDto;
}

/** Vue publique du suivi (sans téléphone, e-mail ni adresse). */
export interface Tracking {
  code: string;
  firstName: string;
  city: string;
  orderDate: string;
  updatedAt: string;
  status: ShipmentStatus;
  shipmentType: ShipmentType;
  itemCount: number;
  total: number;
}
