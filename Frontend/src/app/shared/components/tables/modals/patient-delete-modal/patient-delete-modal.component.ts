import { PatientService,Patient } from './../../../../../../services/patient.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-delete-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './patient-delete-modal.component.html',

})
export class PatientDeleteModalComponent {
   @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() patient:Patient | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private patientService:PatientService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
  if (!this.patient?.id) {
    this.errorMessage = "ID patient manquant";
    return;
  }

  this.isLoading = true;
  this.patientService.delete(this.patient.id).subscribe({
    next: () => {
      console.log('✅ Patient supprimé');
      this.closeDeleteModal(); // ferme le modal après suppression
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur suppression:', error);
      this.errorMessage = 'Erreur lors de la suppression du patient';
      this.isLoading = false;
    }
  });
}


}
