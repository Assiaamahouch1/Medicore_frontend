import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentMedical } from '../../../../../services/consultation.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './medical-record.component.html'
})
export class MedicalRecordComponent {
  @Input() documentMedical: DocumentMedical | null = null;
  @Input() patientId: string = '';
  @Output() save = new EventEmitter<DocumentMedical>();
  @Output() edit = new EventEmitter<void>();

  showForm = false;
  editingDocument: DocumentMedical | null = null;

  onEdit() {
    this.editingDocument = this.documentMedical ? { ...this.documentMedical } : {
      antMedicaux: '',
      antChirug: '',
      allergies: '',
      traitement: '',
      habitudes: '',
      patientId: this.patientId
    };
    this.showForm = true;
    this.edit.emit();
  }

  onSave() {
    if (this.editingDocument) {
      this.save.emit(this.editingDocument);
      this.showForm = false;
    }
  }

  onCancel() {
    this.showForm = false;
    this.editingDocument = null;
  }
}

