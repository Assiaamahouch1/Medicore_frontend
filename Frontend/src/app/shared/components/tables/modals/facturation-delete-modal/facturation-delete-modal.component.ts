import { FacturationService,Facturation } from './../../../../../../services/facturation.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturation-delete-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './facturation-delete-modal.component.html',

})
export class FacturationDeleteModalComponent {
   @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() facturation:Facturation | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private facturationService:FacturationService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
  if (!this.facturation?.idFacture) {
    this.errorMessage = "ID facturation manquant";
    return;
  }

  this.isLoading = true;
  this.facturationService.delete(this.facturation.idFacture).subscribe({
    next: () => {
      console.log('✅ Facturation supprimé');
      this.closeDeleteModal(); // ferme le modal après suppression
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur suppression:', error);
      this.errorMessage = 'Erreur lors de la suppression du facturation';
      this.isLoading = false;
    }
  });
}


}
