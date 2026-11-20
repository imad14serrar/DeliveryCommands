import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Shipment } from '../data-interfaces/Shipment';

/**
 * Page affichée après une commande réussie : donne au client son CODE DE SUIVI
 * (avant, ce code n'était jamais montré et le suivi était donc inutilisable).
 */
@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html'
})
export class OrderConfirmationComponent implements OnInit {
  code = '';
  /** Détail de la commande transmis par la page de paiement (absent si la page est actualisée). */
  shipment: Shipment | null = null;

  constructor(private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';
    const state = history.state?.shipment as Shipment | undefined;
    this.shipment = state && state.code === this.code ? state : null;
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.code).then(
      () => this.toastr.success('Code copié dans le presse-papiers.'),
      () => this.toastr.info('Copiez le code manuellement.')
    );
  }
}
