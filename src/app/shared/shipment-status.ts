import { Pipe, PipeTransform } from '@angular/core';
import { ShipmentStatus } from '../data-interfaces/Shipment';

/** Étapes dans l'ordre, avec libellé et illustration (utilisées par le suivi et l'admin). */
export const SHIPMENT_STEPS: { status: ShipmentStatus; label: string; image: string }[] = [
  { status: 'PROCESSED', label: 'Commande traitée', image: 'assets/order-processing.jpeg' },
  { status: 'SHIPPED', label: 'Expédiée', image: 'assets/orderShipped.jpg' },
  { status: 'ON_THE_WAY', label: 'En route', image: 'assets/orderEnRoute.jpg' },
  { status: 'DELIVERED', label: 'Livrée', image: 'assets/orderArrived.jpg' }
];

export const SHIPMENT_STATUSES: ShipmentStatus[] = SHIPMENT_STEPS.map(s => s.status);

/** Position (0 à 3) d'un statut dans le cycle de vie. */
export function statusIndex(status: ShipmentStatus): number {
  return SHIPMENT_STATUSES.indexOf(status);
}

/** Affiche un statut en français : {{ shipment.status | statusLabel }}. */
@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: ShipmentStatus | null | undefined): string {
    return SHIPMENT_STEPS.find(s => s.status === status)?.label ?? '—';
  }
}
