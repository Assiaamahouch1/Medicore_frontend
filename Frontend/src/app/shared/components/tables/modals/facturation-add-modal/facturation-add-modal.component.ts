import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { FacturationService, Facturation } from '../../../../../../services/facturation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RendezVous, RendezvousService } from '../../../../../../services/rendezvous.service';
import { Patient, PatientService } from '../../../../../../services/patient.service';
import { AuthService, AuthAdmin } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-facturation-add-modal',
  standalone: true,
  imports: [
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './facturation-add-modal.component.html',
})
export class FacturationAddModalComponent implements OnChanges {
  @Input() isAddModalOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  rendezVousList: RendezVous[] = [];
  patients: Patient[] = [];

  user: AuthAdmin = {
    nom: '', prenom: '', username: '', numTel: '', role: '', avatar: '', actif: true, cabinetId: 0
  };

  facture: Facturation = {
    montant: 0,
    modePaiement: '',
    rendezVousId: null,
    date: new Date().toISOString()
  };

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private facturationService: FacturationService,
    private rendezVousService: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isAddModalOpen'] && this.isAddModalOpen) {
      this.loadCurrentUser();
    }
  }

  loadCurrentUser() {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
        this.loadPatients();
        this.loadRendezVous();
      },
      error: (err) => console.error('Erreur chargement user:', err)
    });
  }

  loadPatients() {
    if (!this.user.cabinetId) return;

    this.patientService.getAll(this.user.cabinetId).subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.errorMessage = 'Impossible de charger les patients.';
      }
    });
  }

  loadRendezVous() {
     if (!this.user.cabinetId) {
    console.warn('cabinetId non défini → requête annulée');
    return;
  }
    this.rendezVousService.getRendezVousEnAttente(this.user.cabinetId).subscribe({
      next: (data) => {
        this.rendezVousList = data;
        if (data.length === 0) {
          this.errorMessage = 'Aucun rendez-vous en attente de facturation.';
        } else {
          this.errorMessage = '';
        }
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous.';
        console.error(err);
      }
    });
  }

  // Méthode corrigée avec conversion explicite et gestion des types
getPatientName(patientId: any): string {
  if (!patientId) return 'Patient inconnu';

  // On essaie les deux sens : number → string et string → number
  const patient = this.patients.find(p => 
    p.id === patientId || 
    p.id === String(patientId) || 
    Number(p.id) === patientId
  );

  return patient 
    ? `${patient.nom} ${patient.prenom}`.toUpperCase() 
    : 'Patient inconnu';
}
  handleSave() {
    this.errorMessage = '';

    if (
      !this.facture.montant || this.facture.montant <= 0 ||
      !this.facture.modePaiement ||
      !this.facture.rendezVousId
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;

    this.facturationService.create(this.facture).subscribe({
      next: (created) => {
        console.log('Facture créée:', created);

        this.rendezVousService.confirmer(this.facture.rendezVousId!).subscribe({
          next: () => {
            console.log('RDV confirmé');
            this.closeAddModal();
          },
          error: (err) => {
            console.error('Échec confirmation RDV:', err);
            this.errorMessage = 'Facture créée, mais confirmation du RDV échouée.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur création facture.';
        this.isLoading = false;
      }
    });
  }

  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }

  resetForm() {
    this.facture = {
      montant: 0,
      modePaiement: '',
      rendezVousId: null,
      date: new Date().toISOString().split('T')[0]
    };
    this.errorMessage = '';
  }
}