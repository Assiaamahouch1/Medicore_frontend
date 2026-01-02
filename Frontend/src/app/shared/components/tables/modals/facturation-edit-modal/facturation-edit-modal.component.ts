import { FacturationService,Facturation } from './../../../../../../services/facturation.service';
import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facturation-edit-modal',
  imports: [ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule],
  templateUrl: './facturation-edit-modal.component.html',
})
export class FacturationEditModalComponent {
 @Input() isEditModalOpen: boolean = false; 
  @Input() facturation:Facturation | null = null;
  @Output() close = new EventEmitter<void>();

  editFacturation: Facturation = {
  montant: 0,
  modePaiement: '',
  rendezVousId: 0,
  date:''
  };

  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private facturationService:FacturationService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['facturation'] && this.facturation) {
      // Copie les données de l'admin sélectionné
      this.editFacturation = { ...this.facturation }; 
      this.selectedFile = null;
      this.errorMessage = '';
    }
  }

 


  closeEditModal() {
    this.resetForm();
    this.close.emit();
  }

  handleSave() {
  // Validation
  if (!this.editFacturation.montant || !this.editFacturation.modePaiement ) {
    this.errorMessage = 'Tous les champs sont obligatoires';
    return;
  }

  if (!this.editFacturation.idFacture) {
    this.errorMessage = 'ID Facturation manquant';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Mettre à jour les infos du Facture
  this.facturationService.update(this.editFacturation.idFacture, this.editFacturation).subscribe({
    next: (updatedFacturation) => {
      console.log('✅ Facturation mis à jour:', updatedFacturation);
      // fermer le modal après mise à jour
      this.closeEditModal();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur modification Facture:', error);
      this.errorMessage = 'Erreur lors de la modification de Facture';
      this.isLoading = false;
    }
  });
}

  resetForm() {
    this.editFacturation = {
      montant: 0,
      modePaiement: '',
      rendezVousId: 0,
      date:''
    };
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
