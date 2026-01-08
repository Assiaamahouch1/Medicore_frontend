import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';

import { RendezVous, RendezvousService } from './../../../../../../services/rendezvous.service';
import { PatientService, Patient } from '../../../../../../services/patient.service';
import { AuthAdmin, AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-rendezvous-add-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    LabelComponent,
    ModalComponent
  ],
  templateUrl: './rendezvous-add-modal.component.html',
})
export class RendezvousAddModalComponent implements OnInit {

  /* ================= Inputs / Outputs ================= */
  @Input() isAddModalOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  /* ================= Data ================= */
  patients: Patient[] = [];

  rendezvous: RendezVous = {
    idRdv: 0,
    dateRdv: '',
    heureRdv: '',
    motif: '',
    statut: 'EN_ATTENTE',
    notes: '',
    patientId: '',
    userId: 0
  };


  user!: AuthAdmin;

  /* ================= UI State ================= */
  isLoading: boolean = false;
  errorMessage: string = '';

  /* ================= Constructor ================= */
  constructor(
    private rendezvousService: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  /* ================= Lifecycle ================= */
  ngOnInit(): void {

    this.loadCurrentUser();
  }

  /* ================= Load connected user ================= */
  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user: AuthAdmin) => {
        this.user = user;
        this.rendezvous.userId = user.id; // ✅ affecté AVANT l'envoi
        this.rendezvous.cabinetId=user.cabinetId
            if (this.user.cabinetId) {
        this.loadPatients();
      }else{
        console.error('Erreur chargement ');
      }
      },
      error: (err) => {
        console.error('Erreur chargement utilisateur:', err);
        this.errorMessage = "Impossible de charger l'utilisateur connecté";
      }
    });
  }

 loadPatients(): void {
  if (!this.user.cabinetId) {
    console.warn('cabinetId non défini → requête annulée');
    return;
  }

  console.log('APPEL BACKEND AVEC cabinetId =', this.user.cabinetId);

  this.patientService.getAll(this.user.cabinetId).subscribe({
    next: (data) => {
      console.log('PATIENTS REÇUS:', data);
     this.patients=data;
    },
    error: (err) => {
      console.error('Erreur chargement patients:', err);
    }
  });
}

  /* ================= Save ================= */
 handleSave(): void {

  if (!this.rendezvous.patientId) {
    this.errorMessage = 'Veuillez sélectionner un patient';
    return;
  }

  if (!this.rendezvous.userId) {
    this.errorMessage = 'Utilisateur non valide';
    return;
  }

  if (!this.rendezvous.dateRdv || !this.rendezvous.heureRdv) {
    this.errorMessage = 'Date et heure obligatoires';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  console.log('Rendez-vous envoyé :', this.rendezvous);

  this.rendezvousService.creerRendezVous(this.rendezvous).subscribe({
    next: () => {
      this.isLoading = false;
      this.closeAddModal();
    },
    error: (error) => {
      console.error('Erreur création rendez-vous:', error);
      this.errorMessage = 'Erreur lors de la création du rendez-vous';
      this.isLoading = false;
    }
  });
}

  /* ================= Close ================= */
  closeAddModal(): void {
    this.resetForm();
    this.close.emit();
  }

  /* ================= Reset ================= */
  resetForm(): void {
    this.rendezvous = {
      idRdv: 0,
      dateRdv: '',
      heureRdv: '',
      motif: '',
      statut: 'EN_ATTENTE',
      notes: '',
      patientId: '',
      userId: this.user?.id ?? 0
    };
    this.errorMessage = '';
    this.isLoading = false;
  }
}
