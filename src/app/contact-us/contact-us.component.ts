import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

/**
 * Page Contact. Il n'y a pas de serveur d'e-mails : le formulaire, une fois validé, ouvre la
 * messagerie de l'utilisateur avec le message pré-rempli (lien « mailto: »). C'est honnête :
 * avant, la page affichait « message envoyé » ET « erreur » sans rien envoyer.
 */
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
  readonly shopName = environment.shopName;
  readonly contact = environment.contact;
  opened = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(private fb: FormBuilder) {}

  invalid(name: 'name' | 'email' | 'subject' | 'message'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  /** Construit le lien mailto: (exposé pour pouvoir être testé). */
  buildMailto(): string {
    const { name, email, subject, message } = this.form.getRawValue();
    const body = `${message}\n\n— ${name} (${email})`;
    return `mailto:${this.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    window.location.href = this.buildMailto();
    this.opened = true;
  }
}
