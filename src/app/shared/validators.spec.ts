import { FormControl, FormGroup } from '@angular/forms';
import { detectCardType, expiryValidator, isValidLuhn, luhnValidator } from './validators';

describe('Validateurs de paiement', () => {
  it('Luhn : accepte les numéros de test connus et rejette une faute de frappe', () => {
    expect(isValidLuhn('4111111111111111')).toBeTrue();
    expect(isValidLuhn('5555555555554444')).toBeTrue();
    expect(isValidLuhn('4111111111111112')).toBeFalse();
    expect(isValidLuhn('1234')).toBeFalse();
  });

  it('luhnValidator renvoie une erreur seulement pour un numéro invalide non vide', () => {
    expect(luhnValidator(new FormControl(''))).toBeNull();
    expect(luhnValidator(new FormControl('4111111111111111'))).toBeNull();
    expect(luhnValidator(new FormControl('4111111111111112'))).toEqual({ luhn: true });
  });

  it('expiryValidator refuse une carte expirée et accepte le mois en cours', () => {
    const today = () => new Date(2026, 10, 20); // 20 novembre 2026
    const group = (month: number, year: number) =>
      new FormGroup({ expMonth: new FormControl(month), expYear: new FormControl(year) });

    expect(expiryValidator(today)(group(10, 26))).toEqual({ expired: true });
    expect(expiryValidator(today)(group(11, 26))).toBeNull();
    expect(expiryValidator(today)(group(1, 27))).toBeNull();
  });

  it('détecte le réseau de la carte', () => {
    expect(detectCardType('4111')).toBe('Visa');
    expect(detectCardType('5555')).toBe('Mastercard');
    expect(detectCardType('3782')).toBe('American Express');
    expect(detectCardType('9999')).toBe('');
  });
});
