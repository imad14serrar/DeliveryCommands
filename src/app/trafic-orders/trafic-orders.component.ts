import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Tracking } from '../data-interfaces/Shipment';
import { errorMessage } from '../interceptors/error.interceptor';
import { DataService } from '../service/data-service/data.service';
import { SHIPMENT_STEPS, statusIndex } from '../shared/shipment-status';

/**
 * Suivi de commande. Il faut le code ET l'e-mail utilisé lors de la commande :
 * un simple code ne suffit plus à afficher les informations d'un client.
 */
@Component({
  selector: 'app-trafic-orders',
  templateUrl: './trafic-orders.component.html',
  styleUrls: ['./trafic-orders.component.css']
})
export class TraficOrdersComponent implements OnInit {
  readonly steps = SHIPMENT_STEPS;
  tracking: Tracking | null = null;
  error = '';
  searching = false;

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private fb: FormBuilder, private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Lien « Suivre ma commande » depuis la confirmation : le code est pré-rempli.
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.form.controls.code.setValue(code);
    }
  }

  /** Une étape est « atteinte » si elle est avant ou égale au statut actuel. */
  isReached(stepIndex: number): boolean {
    return !!this.tracking && stepIndex <= statusIndex(this.tracking.status);
  }

  search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { code, email } = this.form.getRawValue();
    this.searching = true;
    this.error = '';
    this.tracking = null;
    this.dataService.trackShipment(code.trim(), email.trim()).subscribe({
      next: tracking => {
        this.tracking = tracking;
        this.searching = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = errorMessage(err);
        this.searching = false;
      }
    });
  }
}
