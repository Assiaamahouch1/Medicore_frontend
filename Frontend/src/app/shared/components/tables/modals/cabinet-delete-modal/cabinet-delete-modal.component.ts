import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { Cabinet } from '../../../../../models/cabinet.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabinet-delete-modal',
  standalone: true,
  imports: [ModalComponent, CommonModule], 
  templateUrl: './cabinet-delete-modal.component.html',
})
export class CabinetDeleteModalComponent {
  @Input() isDeleteModalOpen: boolean = false; 
  @Input() cabinet: Cabinet | null = null;
  @Output() close = new EventEmitter<boolean>();

  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private cabinetService: CabinetService) {}

  closeDeleteModal() {
    this.errorMessage = '';
    this.close.emit(false);
  }

  confirmDelete() {
    if (!this.cabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.deleteCabinet(this.cabinet.id).subscribe({
      next: () => {
        console.log('Cabinet supprimé:', this.cabinet?.nom);
        this.isLoading = false;
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Erreur suppression cabinet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression du cabinet';
        this.isLoading = false;
      }
    });
  }
}