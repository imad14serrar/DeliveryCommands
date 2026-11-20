import { Component } from '@angular/core';

/** Page 404 pour toute URL inconnue (avant : page blanche). */
@Component({
  selector: 'app-not-found',
  template: `
    <div class="container text-center py-5">
      <h1 class="display-4">404</h1>
      <p class="lead">Cette page n'existe pas.</p>
      <a routerLink="/produits" class="btn btn-primary">Retour à la boutique</a>
    </div>
  `
})
export class NotFoundComponent {}
