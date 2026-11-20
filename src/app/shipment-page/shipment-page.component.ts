import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShippingInfo } from '../data-interfaces/Shipment';
import { ShipmentType } from '../data-interfaces/ShipmentType';
import { CartService } from '../service/cart-service/cart.service';
import { CheckoutService } from '../service/checkout-service/checkout.service';
import { DataService } from '../service/data-service/data.service';
import { PHONE_PATTERN, POSTAL_CODE_PATTERN } from '../shared/validators';

export const CITIES = ['Agadir', 'Casablanca', 'Fès', 'Meknès', 'Oujda', 'Rabat', 'Tanger', 'Tétouan'];

/** Étape 2 du tunnel : informations de livraison et choix du mode de livraison. */
@Component({
  selector: 'app-shipment-page',
  templateUrl: './shipment-page.component.html',
  styleUrls: ['./shipment-page.component.css']
})
export class ShipmentPageComponent implements OnInit {
  readonly cities = CITIES;
  shipmentTypes: ShipmentType[] = [];
  submitted = false;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(POSTAL_CODE_PATTERN)]],
    shipmentTypeCode: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private cart: CartService,
    private checkout: CheckoutService
  ) {}

  ngOnInit(): void {
    // Retour depuis la page de paiement : on pré-remplit le formulaire.
    if (this.checkout.shipping) {
      this.form.patchValue(this.checkout.shipping);
    }
    this.dataService.getShipmentTypes().subscribe(types => {
      this.shipmentTypes = types;
      // Correction : le mode présélectionné ET son prix viennent de la même source (plus de 14 codé en dur).
      if (!this.form.controls.shipmentTypeCode.value && types.length > 0) {
        this.form.controls.shipmentTypeCode.setValue(types[0].code);
      }
    });
  }

  get productsTotal(): number {
    return this.cart.total;
  }

  get selectedShipmentType(): ShipmentType | undefined {
    return this.shipmentTypes.find(t => t.code === this.form.controls.shipmentTypeCode.value);
  }

  get shippingCost(): number {
    return this.selectedShipmentType?.price ?? 0;
  }

  get total(): number {
    return this.productsTotal + this.shippingCost;
  }

  /** Vrai si le champ doit afficher son erreur (après saisie ou après tentative d'envoi). */
  showError(name: keyof ShippingInfo): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    const type = this.selectedShipmentType;
    if (this.form.invalid || !type) {
      this.form.markAllAsTouched();
      return;
    }
    this.checkout.saveShipping(this.form.getRawValue(), type);
    this.router.navigate(['/paiement']);
  }
}
