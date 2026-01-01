import { RendezvousService,RendezVous } from './../../../../../../services/rendezvous.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rendezvous-delete-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './rendezvous-delete-modal.component.html',
})
export class RendezvousDeleteModalComponent {
  @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() rendezvous:RendezVous | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private rendezvousservice:RendezvousService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
  if (!this.rendezvous?.idRdv) {
    this.errorMessage = "ID rendez vous manquant";
    return;
  }

  this.isLoading = true;
  this.rendezvousservice.annulerRendezVous(this.rendezvous.idRdv).subscribe({
    next: () => {
      console.log('✅ Rendez Vous annulé');
      this.closeDeleteModal(); // ferme le modal après suppression
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur suppression:', error);
      this.errorMessage = 'Erreur lors de l annulation du rendez vous';
      this.isLoading = false;
    }
  });
}

}
