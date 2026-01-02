import { Patient } from './../../../../../../services/patient.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common'; // ← AJOUTER CECI

@Component({
  selector: 'app-patient-show-modal',
  imports: [ButtonComponent,LabelComponent,ModalComponent,CommonModule],
  templateUrl: './patient-show-modal.component.html',
})
export class PatientShowModalComponent {
@Input() isShowModalOpen: boolean = false; 
  @Input() patient:Patient | null = null;
  @Output() close = new EventEmitter<void>();


 
  closeShowModal() {
  this.close.emit();
}


  handleSave() {
  console.log('Saving...', this.patient);
  this.close.emit();
}

}
