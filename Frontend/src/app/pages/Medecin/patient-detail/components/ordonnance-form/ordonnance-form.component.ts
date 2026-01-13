import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateOrdonnanceRequest, CreateLigneOrdonnanceRequest } from '../../../../../../services/consultation.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './ordonnance-form.component.html'
})
export class OrdonnanceFormComponent {
  @Input() ordonnance: CreateOrdonnanceRequest = {
    consultationId: '',
    type: '',
    lignes: []
  };
  @Input() show = false;
  @Output() save = new EventEmitter<CreateOrdonnanceRequest>();
  @Output() cancel = new EventEmitter<void>();

  newLigne: CreateLigneOrdonnanceRequest = {
    description: '',
    dosage: '',
    duree: '',
    medicamentId: undefined
  };

  addLigne() {
    if (this.newLigne.description || this.newLigne.dosage) {
      this.ordonnance.lignes = this.ordonnance.lignes || [];
      this.ordonnance.lignes.push({ ...this.newLigne });
      this.newLigne = {
        description: '',
        dosage: '',
        duree: '',
        medicamentId: undefined
      };
    }
  }

  removeLigne(index: number) {
    if (this.ordonnance.lignes) {
      this.ordonnance.lignes.splice(index, 1);
    }
  }

  onSave() {
    this.save.emit(this.ordonnance);
    window.location.reload();
  }

  onCancel() {
    this.cancel.emit();
  }
}

