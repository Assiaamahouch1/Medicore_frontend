import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { SecretaireService, Secretaire } from '../../../../../../services/secretaire.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-secretaire-delete-modal',
  imports: [ModalComponent, CommonModule], 
  templateUrl: './secretaire-delete-modal.component.html',
})
export class SecretaireDeleteModalComponent {
  @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() secretaire: Secretaire | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private secretaireService: SecretaireService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
      if (!this.secretaire?.id) {
        this.errorMessage = 'ID secretaire manquant';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.secretaireService.deleteSecretaire(this.secretaire.id).subscribe({
        next: () => {
          console.log('✅ Secretaire supprimé:', this.secretaire?.id);
          this.isLoading = false;
          this.close.emit(true); // ✅ Suppression réussie
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression';
          this.isLoading = false;
        }
      });
    }


}
