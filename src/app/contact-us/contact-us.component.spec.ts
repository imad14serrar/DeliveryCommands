import { TestBed } from '@angular/core/testing';
import { setupTestBed } from '../testing/test-helpers';
import { ContactUsComponent } from './contact-us.component';

describe('ContactUsComponent', () => {
  beforeEach(() => setupTestBed([ContactUsComponent]));

  it('n\'affiche plus en permanence les messages « succès » et « erreur »', () => {
    const fixture = TestBed.createComponent(ContactUsComponent);
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent;
    expect(text).not.toContain('envoyé');
    expect(text).not.toContain('Oops');
  });

  it('construit un lien mailto avec l\'objet et le message encodés', () => {
    const fixture = TestBed.createComponent(ContactUsComponent);
    const component = fixture.componentInstance;
    component.form.setValue({ name: 'Sara', email: 'sara@example.com', subject: 'Ma commande', message: 'Bonjour & merci' });
    const link = component.buildMailto();
    expect(link).toContain('subject=Ma%20commande');
    expect(link).toContain('Bonjour%20%26%20merci');
  });
});
