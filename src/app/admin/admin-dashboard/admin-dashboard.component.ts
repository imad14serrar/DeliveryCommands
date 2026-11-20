import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardStats } from 'src/app/data-interfaces/Admin';
import { Shipment, ShipmentStatus } from 'src/app/data-interfaces/Shipment';
import { AdminService } from 'src/app/service/admin-service/admin.service';
import { AuthService } from 'src/app/service/auth-service/auth.service';
import { SHIPMENT_STEPS } from 'src/app/shared/shipment-status';

/** Tableau de bord : indicateurs, liste des commandes filtrable et changement de statut. */
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  readonly steps = SHIPMENT_STEPS;
  stats: DashboardStats | null = null;
  shipments: Shipment[] = [];
  statusFilter: ShipmentStatus | '' = '';
  search = '';
  expandedCode: string | null = null;
  updatingCode: string | null = null;

  constructor(
    private admin: AdminService,
    public auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.admin.getStats().subscribe(stats => (this.stats = stats));
    this.admin.getShipments(this.statusFilter || undefined).subscribe(list => (this.shipments = list));
  }

  setStatusFilter(status: ShipmentStatus | ''): void {
    this.statusFilter = status;
    this.refresh();
  }

  /** Commandes en cours = toutes sauf les livrées. */
  get pendingOrders(): number {
    if (!this.stats) {
      return 0;
    }
    return this.stats.totalOrders - (this.stats.ordersByStatus.DELIVERED ?? 0);
  }

  /** Recherche locale par code, nom, ville ou e-mail. */
  get visibleShipments(): Shipment[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.shipments;
    }
    return this.shipments.filter(s =>
      [s.code, s.firstName, s.lastName, s.city, s.email].some(v => v.toLowerCase().includes(term))
    );
  }

  toggle(code: string): void {
    this.expandedCode = this.expandedCode === code ? null : code;
  }

  changeStatus(shipment: Shipment, status: ShipmentStatus): void {
    if (status === shipment.status) {
      return;
    }
    this.updatingCode = shipment.code;
    this.admin.updateStatus(shipment.code, status).subscribe({
      next: updated => {
        Object.assign(shipment, updated);
        this.updatingCode = null;
        this.toastr.success(`Commande ${updated.code} mise à jour.`);
        this.admin.getStats().subscribe(stats => (this.stats = stats));
        if (this.statusFilter && this.statusFilter !== status) {
          this.shipments = this.shipments.filter(s => s.code !== shipment.code);
        }
      },
      error: () => {
        this.updatingCode = null;
        this.refresh(); // remet la liste dans l'état réel du serveur
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/connexion']);
  }

  trackByCode(_: number, s: Shipment): string {
    return s.code;
  }
}
