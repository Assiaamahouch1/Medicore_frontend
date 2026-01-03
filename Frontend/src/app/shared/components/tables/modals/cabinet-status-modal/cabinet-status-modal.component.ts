import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { Cabinet, SubscriptionStatus } from '../../../../../models/cabinet.model';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabinet-status-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, FormsModule, CommonModule], 
  templateUrl: './cabinet-status-modal.component.html',
})
export class CabinetStatusModalComponent implements OnChanges {
  @Input() isStatusModalOpen: boolean = false; 
  @Input() cabinet: Cabinet | null = null;
  @Output() close = new EventEmitter<boolean>();

  // Cabinet normalisé (gère camelCase/snake_case)
  normalizedCabinet: Cabinet | null = null;

  subscriptionStatus: SubscriptionStatus | null = null;
  loadingStatus: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Pour le renouvellement
  renewMonths: number = 12;
  newExpirationDate: string = '';
  
  constructor(private cabinetService: CabinetService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cabinet'] && this.cabinet) {
      // Normaliser le cabinet pour gérer camelCase/snake_case
      this.normalizedCabinet = this.normalizeCabinet(this.cabinet);
      
      if (this.normalizedCabinet.id) {
        this.loadSubscriptionStatus(this.normalizedCabinet.id);
      }
      this.setDefaultExpirationDate();
    }
  }

  // Normalise les champs du cabinet
  private normalizeCabinet(c: any): Cabinet {
    return {
      id: c.id,
      logo: c.logo,
      nom: c.nom,
      specialite: c.specialite,
      adresse: c.adresse,
      tel: c.tel,
      service_actif: c.service_actif ?? c.serviceActif ?? false,
      date_expiration_service: c.date_expiration_service ?? c.dateExpirationService ?? null
    };
  }

  // Vérifie si l'activation est possible
  canActivate(): boolean {
    if (!this.subscriptionStatus) return false;
    return !this.subscriptionStatus.expired && this.subscriptionStatus.daysRemaining > 0;
  }

  setDefaultExpirationDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    this.newExpirationDate = today.toISOString().split('T')[0];
  }

  loadSubscriptionStatus(cabinetId: number) {
    this.loadingStatus = true;
    this.cabinetService.getSubscriptionStatus(cabinetId).subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
        this.loadingStatus = false;
      },
      error: () => {
        this.subscriptionStatus = null;
        this.loadingStatus = false;
      }
    });
  }

  closeStatusModal() {
    this.errorMessage = '';
    this.close.emit(false);
  }

  activateService() {
    if (!this.normalizedCabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    // Vérifier si l'activation est possible
    if (!this.canActivate()) {
      this.errorMessage = 'Veuillez d\'abord définir une date d\'expiration future avant d\'activer le service.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.activateCabinet(this.normalizedCabinet.id).subscribe({
      next: () => {
        console.log('Cabinet activé:', this.normalizedCabinet?.nom);
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Erreur activation cabinet:', error);
        // Message d'erreur plus explicite
        if (error.status === 400) {
          this.errorMessage = 'Impossible d\'activer : veuillez d\'abord définir ou renouveler la date d\'expiration.';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'activation du cabinet';
        }
        this.isLoading = false;
      }
    });
  }

  deactivateService() {
    if (!this.normalizedCabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.deactivateCabinet(this.normalizedCabinet.id).subscribe({
      next: () => {
        console.log('Cabinet désactivé:', this.normalizedCabinet?.nom);
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Erreur désactivation cabinet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la désactivation du cabinet';
        this.isLoading = false;
      }
    });
  }

  renewSubscription() {
    if (!this.normalizedCabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.renewSubscription(this.normalizedCabinet.id, this.renewMonths).subscribe({
      next: () => {
        console.log('Abonnement renouvelé:', this.renewMonths, 'mois');
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Erreur renouvellement:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du renouvellement de l\'abonnement';
        this.isLoading = false;
      }
    });
  }

  setExpirationDate() {
    if (!this.normalizedCabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    if (!this.newExpirationDate) {
      this.errorMessage = 'Veuillez sélectionner une date d\'expiration';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.setExpiration(this.normalizedCabinet.id, this.newExpirationDate).subscribe({
      next: () => {
        console.log('Date d\'expiration définie:', this.newExpirationDate);
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Erreur définition expiration:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la définition de la date d\'expiration';
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(): string {
    if (this.normalizedCabinet?.service_actif) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  isServiceActive(): boolean {
    return this.normalizedCabinet?.service_actif ?? false;
  }

  getExpirationClass(): string {
    if (!this.subscriptionStatus) return 'text-gray-500';
    
    if (this.subscriptionStatus.expired) {
      return 'text-red-600 dark:text-red-400';
    } else if (this.subscriptionStatus.daysRemaining <= 30) {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-green-600 dark:text-green-400';
  }
}