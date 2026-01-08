import { ConsultationService, DocumentMedical } from './../../../../../services/consultation.service';
import { PatientShowModalComponent } from './../modals/patient-show-modal/patient-show-modal.component';
import { PatientEditModalComponent } from './../modals/patient-edit-modal/patient-edit-modal.component';
import { PatientDeleteModalComponent } from './../modals/patient-delete-modal/patient-delete-modal.component';
import { PatientAddModalComponent } from './../modals/patient-add-modal/patient-add-modal.component';
import { PatientDossierModalComponent } from './../modals/patient-dossier-modal/patient-dossier-modal.component';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { PatientService, Patient } from '../../../../../services/patient.service';
import { AuthService, AuthAdmin } from './../../../../../services/auth.service';

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    PatientAddModalComponent,
    PatientEditModalComponent,
    PatientDeleteModalComponent,
    PatientShowModalComponent,
    PatientDossierModalComponent
  ],
  templateUrl: './patient-table.component.html',
  styles: []
})
export class PatientTableComponent implements OnInit {
  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
    avatar: '',
    actif: true,
    cabinetId: 0,
  };
  selectedDocument: DocumentMedical | null = null;

  transactionData: Patient[] = [];
  filteredData: Patient[] = [];
  selectedPatient: Patient | null = null;
  searchTerm: string = '';


  currentPage = 1;
  itemsPerPage = 6;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;
  isDocModalOpen = false;

  constructor(
    public modal: ModalService,
    private patientService: PatientService,
    private authService: AuthService,
    private docService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
        if (this.user.cabinetId) {
          this.loadPatients();
        } else {
          console.error('cabinetId manquant');
        }
      },
      error: (err) => console.error('Erreur chargement user:', err)
    });
  }

  loadPatients(): void {
    if (!this.user.cabinetId) return;

    this.patientService.getAll(this.user.cabinetId).subscribe({
      next: (data) => {
        this.transactionData = data;
        this.filteredData = [...data];
      },
      error: (err) => console.error('Erreur chargement patients:', err)
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(patient =>
        patient.nom?.toLowerCase().includes(term) ||
        patient.prenom?.toLowerCase().includes(term) ||
        patient.cin?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): Patient[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // === Modales classiques ===
  openAddModal() { this.isAddModalOpen = true; }
  closeAddModal() { this.isAddModalOpen = false; this.loadPatients(); }
  // === Modales classiques ===
  // Dans patient-table.component.ts

openDocModal(patient: Patient) {
  this.selectedPatient = patient;

  // Charger le dossier médical existant (s'il existe)
  this.docService.getByPatientDoc(patient.id!).subscribe({
    next: (existingDoc) => {
      // Si un dossier existe, on le passe au modal (on ajoutera une @Input pour ça)
      this.selectedDocument = existingDoc; // nouvelle propriété à ajouter
      this.isDocModalOpen = true;
    },
    error: (err) => {
      // Si erreur ou pas de dossier (404 probablement), on crée un nouveau vide
      console.log('Aucun dossier médical trouvé, mode création');
      this.selectedDocument = null; // ou un objet vide
      this.isDocModalOpen = true;
    }
  });
}

closeDocModal() {
  this.isDocModalOpen = false; // ← Bonne variable
  this.selectedPatient = null;
  // this.loadPatients(); // Optionnel : seulement si tu veux recharger après création
}
  openEditModal(patient: Patient) { this.selectedPatient = patient; this.isEditModalOpen = true; }
  closeEditModal() { this.isEditModalOpen = false; this.selectedPatient = null; this.loadPatients(); }

  openDeleteModal(patient: Patient) { this.selectedPatient = patient; this.isDeleteModalOpen = true; }
  closeDeleteModal(deleted: boolean = false) { this.isDeleteModalOpen = false; this.selectedPatient = null; if (deleted) this.loadPatients(); }

  openShowModal(patient: Patient) { this.selectedPatient = patient; this.isShowModalOpen = true; }
  closeShowModal() { this.isShowModalOpen = false; this.selectedPatient = null; }

  

 

  handleFilter() {
    console.log('Filter clicked');
  }
}