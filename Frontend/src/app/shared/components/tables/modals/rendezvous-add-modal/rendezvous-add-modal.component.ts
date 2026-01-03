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
    patientId: 0,
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
    this.loadPatients();
    this.loadCurrentUser();
  }

  /* ================= Load connected user ================= */
  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user: AuthAdmin) => {
        this.user = user;
        this.rendezvous.userId = user.id; // ✅ affecté AVANT l'envoi
      },
      error: (err) => {
        console.error('Erreur chargement utilisateur:', err);
        this.errorMessage = "Impossible de charger l'utilisateur connecté";
      }
    });
  }

  /* ================= Load patients ================= */
  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.errorMessage = 'Erreur lors du chargement des patients';
      }
    });
  }

  /* ================= Save ================= */
  handleSave(): void {

   

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
      statut: '',
      notes: '',
      patientId: 0,
      userId: this.user?.id ?? 0
    };
    this.errorMessage = '';
    this.isLoading = false;
  }
}
