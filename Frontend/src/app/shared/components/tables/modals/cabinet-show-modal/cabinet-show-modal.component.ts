import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { Cabinet, SubscriptionStatus } from '../../../../../models/cabinet.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabinet-show-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, CommonModule], 
  templateUrl: './cabinet-show-modal.component.html',
})
export class CabinetShowModalComponent implements OnChanges {
  @Input() isShowModalOpen: boolean = false; 
  @Input() cabinet: Cabinet | null = null;
  @Output() close = new EventEmitter<void>();

  logoDataUrl: string = '/images/logo/Medicore.png';
  subscriptionStatus: SubscriptionStatus | null = null;
  loadingStatus: boolean = false;
  
  constructor(private cabinetService: CabinetService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cabinet'] && this.cabinet) {
      if (this.cabinet.logo) {
        this.loadLogo(this.cabinet.logo);
      } else {
        this.logoDataUrl = '/images/logo/Medicore.png';
      }
      
      if (this.cabinet.id) {
        this.loadSubscriptionStatus(this.cabinet.id);
      }
    }
  }

  loadLogo(logoFilename: string) {
    this.cabinetService.getLogo(logoFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.logoDataUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.logoDataUrl = '/images/logo/Medicore.png';
      }
    });
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

  closeShowModal() {
    this.close.emit();
  }

  getStatusBadgeClass(): string {
    if (this.cabinet?.service_actif) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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