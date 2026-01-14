import { MedicamentService,Medicament } from './../../../../../../services/medicament.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medicament-delete-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './medicament-delete-modal.component.html',
})
export class MedicamentDeleteModalComponent {
 @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() medicament:Medicament | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private medicamentService:MedicamentService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
  if (!this.medicament?.id) {
    this.errorMessage = "ID medicament manquant";
    return;
  }

  this.isLoading = true;
  this.medicamentService.delete(this.medicament.id).subscribe({
    next: () => {
      console.log('✅ Medicament supprimé');
      this.closeDeleteModal(); // ferme le modal après suppression
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur suppression:', error);
      this.errorMessage = 'Erreur lors de la suppression du medicament';
      this.isLoading = false;
    }
  });
}
}