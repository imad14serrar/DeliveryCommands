import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../service/cart-service/cart.service';
import { CheckoutService } from '../service/checkout-service/checkout.service';
import { DataService } from '../service/data-service/data.service';
import { detectCardType, expiryValidator, luhnValidator } from '../shared/validators';

/**
 * Étape 3 du tunnel : paiement (SIMULÉ).
 * Les données de carte sont seulement vérifiées dans le navigateur (format, Luhn, date) et ne sont
 * jamais envoyées au serveur. Seule la commande (produits + livraison) est transmise.
 */
@Component({
  selector: 'app-paiment-online',
  templateUrl: './paiment-online.component.html',
  styleUrls: ['./paiment-online.component.css']
})
export class PaimentOnlineComponent {
  pendingPayment = false;

  readonly paymentForm = this.fb.nonNullable.group(
    {
      cardOwner: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/), luhnValidator]],
      expMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expYear: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    },
    { validators: expiryValidator() }
  );

  readonly cardType$ = this.paymentForm.controls.cardNumber.valueChanges.pipe(
    startWith(''),
    map(value => detectCardType(value))
  );

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private cart: CartService,
    public checkout: CheckoutService,
    private toastr: ToastrService
  ) {}

  get productsTotal(): number {
    return this.cart.total;
  }

  isInvalid(name: 'cardOwner' | 'cardNumber' | 'expMonth' | 'expYear' | 'cvv'): boolean {
    const control = this.paymentForm.controls[name];
    return control.invalid && control.touched;
  }

  get expiryInvalid(): boolean {
    const { expMonth, expYear } = this.paymentForm.controls;
    return !!this.paymentForm.errors?.['expired'] && expMonth.touched && expYear.touched;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || this.pendingPayment) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.pendingPayment = true;
    // Correction : on attend la réponse du serveur AVANT de confirmer (avant, « Paiement confirmé »
    // s'affichait même si la commande échouait).
    this.dataService.createShipment(this.checkout.buildRequest()).subscribe({
      next: shipment => {
        this.cart.clear();
        this.checkout.reset();
        this.toastr.success('Votre commande a été enregistrée.', 'Merci !');
        this.router.navigate(['/confirmation', shipment.code], { state: { shipment } });
      },
      error: () => {
        // Le message d'erreur est affiché par l'ErrorInterceptor ; l'utilisateur peut réessayer.
        this.pendingPayment = false;
      }
    });
  }
}
