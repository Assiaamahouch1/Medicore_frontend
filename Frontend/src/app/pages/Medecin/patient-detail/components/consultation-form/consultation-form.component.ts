import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultation } from '../../../../../../services/consultation.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './consultation-form.component.html'
})
export class ConsultationFormComponent {
  @Input() consultation: Consultation = {
    type: '',
    dateConsultation: new Date(),
    examenClinique: '',
    examenComplementaire: '',
    diagnostic: '',
    traitement: '',
    observations: '',
    patientId: ''
  };
  @Input() show = false;
  @Output() save = new EventEmitter<Consultation>();
  @Output() cancel = new EventEmitter<void>();

  onSave() {
    this.save.emit(this.consultation);
  }

  onCancel() {
    this.cancel.emit();
  }

  getDateString(date: Date | string | undefined): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }
  onDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.consultation.dateConsultation = new Date(target.value);
    }
  }
}

