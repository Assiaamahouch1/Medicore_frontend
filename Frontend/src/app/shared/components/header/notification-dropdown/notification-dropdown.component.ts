import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { CabinetService, Cabinet } from '../../../../../services/cabinet.service';
import { Subscription, interval } from 'rxjs';

export interface ExpirationAlert {
  cabinet: Cabinet;
  daysRemaining: number;
  urgency: 'critical' | 'warning' | 'info';
}

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifying = false;
  alerts: ExpirationAlert[] = [];
  private refreshSubscription?: Subscription;

  constructor(private cabinetService: CabinetService) {}

  ngOnInit() {
    this.loadAlerts();
    // Rafraîchir toutes les 5 minutes
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.loadAlerts();
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  loadAlerts() {
    // Récupérer les cabinets qui expirent dans les 14 prochains jours
    this.cabinetService.getExpiringCabinets(14).subscribe({
      next: (cabinets) => {
        this.alerts = cabinets.map(cabinet => {
          const daysRemaining = this.calculateDaysRemaining(cabinet.date_expiration_service);
          return {
            cabinet,
            daysRemaining,
            urgency: this.getUrgency(daysRemaining)
          };
        });
        this.notifying = this.alerts.length > 0;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes:', err);
      }
    });
  }

  private calculateDaysRemaining(expirationDate?: string): number {
    if (!expirationDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getUrgency(daysRemaining: number): 'critical' | 'warning' | 'info' {
    if (daysRemaining <= 3) return 'critical';
    if (daysRemaining <= 7) return 'warning';
    return 'info';
  }

  getUrgencyColor(urgency: 'critical' | 'warning' | 'info'): string {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-400';
      case 'info': return 'bg-blue-400';
    }
  }

  getUrgencyTextColor(urgency: 'critical' | 'warning' | 'info'): string {
    switch (urgency) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-orange-600 dark:text-orange-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadAlerts(); // Rafraîchir à l'ouverture
    }
  }

  closeDropdown() {
    this.isOpen = false;
  }
}