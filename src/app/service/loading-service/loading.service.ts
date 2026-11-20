import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

/** Compte les requêtes HTTP en cours ; la navbar affiche une barre de chargement tant qu'il y en a. */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly pending = new BehaviorSubject<number>(0);

  readonly loading$ = this.pending.pipe(map(n => n > 0), distinctUntilChanged());

  start(): void {
    this.pending.next(this.pending.value + 1);
  }

  stop(): void {
    this.pending.next(Math.max(0, this.pending.value - 1));
  }
}
