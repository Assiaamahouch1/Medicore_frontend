import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { RendezVous, RendezvousService } from '../../../../../../services/rendezvous.service';

@Component({
  selector: 'app-rendezvous-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    LabelComponent,
    ModalComponent
  ],
  templateUrl: './rendezvous-edit-modal.component.html',
})
export class RendezvousEditModalComponent implements OnChanges {
  @Input() isEditModalOpen: boolean = false;
  @Input() rendezvous: RendezVous | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<RendezVous>(); // Émet le RDV mis à jour

  // Copie éditable du rendez-vous
  editedRendezvous: Partial<RendezVous> = {
    dateRdv: '',
    heureRdv: '',
    motif: '',
    notes: ''
  };

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private rendezvousService: RendezvousService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rendezvous'] && this.rendezvous) {
      // Convertir la date (java.util.Date → string YYYY-MM-DD)
      const dateStr = this.rendezvous.dateRdv
        ? new Date(this.rendezvous.dateRdv).toISOString().split('T')[0]
        : '';

      this.editedRendezvous = {
        idRdv: this.rendezvous.idRdv,
        dateRdv: dateStr,
        heureRdv: this.rendezvous.heureRdv || '',
        motif: this.rendezvous.motif || '',
        notes: this.rendezvous.notes || ''
      };

      this.errorMessage = '';
    }
  }

 handleSave() {
  if (!this.rendezvous?.idRdv) {
    this.errorMessage = 'ID du rendez-vous manquant';
    return;
  }

  if (!this.editedRendezvous.dateRdv || !this.editedRendezvous.heureRdv?.trim()) {
    this.errorMessage = 'La date et l\'heure sont obligatoires';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Objet à envoyer au backend
  const updateData: any = {};

  // Conversion de la date string (YYYY-MM-DD) en format ISO pour java.util.Date
  if (this.editedRendezvous.dateRdv) {
    // Crée une Date à minuit (heure locale) → Jackson la convertira en java.util.Date
    const isoDate = new Date(this.editedRendezvous.dateRdv + 'T00:00:00').toISOString();
    updateData.dateRdv = isoDate;
  }

  // Heure
  if (this.editedRendezvous.heureRdv?.trim()) {
    updateData.heureRdv = this.editedRendezvous.heureRdv.trim();
  }

  // Motif (seulement si rempli)
  if (this.editedRendezvous.motif?.trim()) {
    updateData.motif = this.editedRendezvous.motif.trim();
  }

  // Notes : accepte vide ou rempli
  if (this.editedRendezvous.notes !== undefined) {
    const notes = this.editedRendezvous.notes?.trim();
    updateData.notes = notes === '' ? '' : notes; // Envoie chaîne vide si effacé
  }

  // Appel au service
  this.rendezvousService.updatePartiel(this.rendezvous.idRdv, updateData).subscribe({
    next: (updatedRdv) => {
      console.log('Rendez-vous mis à jour avec succès :', updatedRdv);
      this.updated.emit(updatedRdv);     // Informe le parent (tableau)
      this.closeEditModal();            // Ferme le modal
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Erreur lors de la modification :', err);
      this.errorMessage = 'Impossible de sauvegarder les modifications. Vérifiez votre connexion ou réessayez.';
      this.isLoading = false;
    }
  });
}
  closeEditModal() {
    this.errorMessage = '';
    this.isLoading = false;
    this.close.emit();
  }
}