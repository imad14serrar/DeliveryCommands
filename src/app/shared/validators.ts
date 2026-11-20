import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PHONE_PATTERN = /^0\d{9}$/;
export const POSTAL_CODE_PATTERN = /^\d{5}$/;

/**
 * Algorithme de Luhn : détecte les fautes de frappe dans un numéro de carte.
 * (Ce n'est PAS une vérification bancaire : le paiement reste simulé.)
 */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export const luhnValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) {
    return null; // laissé à Validators.required
  }
  return isValidLuhn(value) ? null : { luhn: true };
};

/** Validateur de groupe : la date d'expiration (mois / année sur 2 chiffres) ne doit pas être passée. */
export function expiryValidator(today: () => Date = () => new Date()): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const month = Number(group.get('expMonth')?.value);
    const year = Number(group.get('expYear')?.value);
    if (!month || year === null || Number.isNaN(year) || month < 1 || month > 12) {
      return null; // les validateurs de chaque champ s'en chargent
    }
    const now = today();
    const fullYear = 2000 + year;
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
    const cardMonthIndex = fullYear * 12 + (month - 1);
    return cardMonthIndex < currentMonthIndex ? { expired: true } : null;
  };
}

/** Détecte le réseau de la carte à partir de ses premiers chiffres (affichage uniquement). */
export function detectCardType(cardNumber: string): string {
  const n = (cardNumber ?? '').replace(/\s+/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'American Express';
  if (/^6(011|5)/.test(n)) return 'Discover';
  return '';
}
