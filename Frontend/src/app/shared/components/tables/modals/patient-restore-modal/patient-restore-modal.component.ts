import { PatientService,Patient } from './../../../../../../services/patient.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-restore-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './patient-restore-modal.component.html',

})
export class PatientRestoreModalComponent {
   @Input() isRestoreModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() patient:Patient | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private patientService:PatientService) {}

 
  closeRestoreModal() {
  this.close.emit();
}

  confirmRestore() {
  if (!this.patient?.id) {
    this.errorMessage = "ID patient manquant";
    return;
  }

  this.isLoading = true;
  this.patientService.restore(this.patient.id).subscribe({
    next: () => {
      console.log('✅ Patient Restauré');
      this.closeRestoreModal();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur restauration:', error);
      this.errorMessage = 'Erreur lors de la restauration du patient';
      this.isLoading = false;
    }
  });
}


}
