import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { FacturationService,Facturation } from '../../../../../../services/facturation.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturation-add-modal',
  imports: [ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './facturation-add-modal.component.html',
})
export class FacturationAddModalComponent {
 @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();
  
  facture: Facturation = {
  montant: 0,
  modePaiement: '',
  rendezVousId: 0,
  date:''
  };
  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  constructor(private facturationService: FacturationService) {}

 
  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }
  handleSave() {
  // Validation
  if (!this.facture.montant || !this.facture.modePaiement
  ) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Créer le Facturation
  this.facturationService.create(this.facture).subscribe({
    next: (createFacturation) => {
      console.log('Facturation créé:', createFacturation);
      // fermer le modal après création
      this.closeAddModal();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur création facturation:', error);
      this.errorMessage = 'Erreur lors de la création du facturation';
      this.isLoading = false;
    }
  });
}

  resetForm() {
    this.facture = {
       montant: 0,
    modePaiement: '',
    rendezVousId: 0,
    date:''
      
    };
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
