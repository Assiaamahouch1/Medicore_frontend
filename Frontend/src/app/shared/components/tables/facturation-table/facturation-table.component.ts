import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { FacturationService, Facturation } from '../../../../../services/facturation.service';
import { RendezVous, RendezvousService } from '../../../../../services/rendezvous.service';
import { Patient, PatientService } from '../../../../../services/patient.service';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';

import { FacturationAddModalComponent } from './../modals/facturation-add-modal/facturation-add-modal.component';
import { FacturationEditModalComponent } from './../modals/facturation-edit-modal/facturation-edit-modal.component';
import { FacturationDeleteModalComponent } from './../modals/facturation-delete-modal/facturation-delete-modal.component';
import { FacturationShowModalComponent } from './../modals/facturation-show-modal/facturation-show-modal.component';
import { FacturationPrintModalComponent } from './../modals/facturation-print-modal/facturation-print-modal.component';

@Component({
  selector: 'app-facturation-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    FacturationAddModalComponent,
    FacturationEditModalComponent,
    FacturationDeleteModalComponent,
    FacturationShowModalComponent,
    FacturationPrintModalComponent
  ],
  templateUrl: './facturation-table.component.html',
  styles: ``
})
export class FacturationTableComponent implements OnInit {

  transactionData: Facturation[] = [];
  filteredData: Facturation[] = [];
  selectedFacturation: Facturation | null = null;
  searchTerm: string = '';

  // Données nécessaires pour l'impression
  patients: Patient[] = [];
  rendezvousList: RendezVous[] = [];
  isPrintModalOpen = false;

  currentPage = 1;
  itemsPerPage = 6;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

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

  constructor(
    public modal: ModalService,
    private facturationService: FacturationService,
    private rendezvousService: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
        console.log('USER CHARGÉ:', this.user);

        // Chargement dans l'ordre logique
        this.loadPatients();
        this.loadRendezVous();
        this.loadFacturations(); // Doit être après cabinetId connu
      },
      error: (err) => {
        console.error('Erreur chargement user:', err);
      }
    });
  }

  loadPatients(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini → patients non chargés');
      return;
    }

    this.patientService.getAll(this.user.cabinetId).subscribe({
      next: (data) => {
        this.patients = data;
        console.log('PATIENTS CHARGÉS:', this.patients.length);
      },
      error: (err) => console.error('Erreur chargement patients:', err)
    });
  }

  loadRendezVous(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini → RDV non chargés');
      return;
    }

    this.rendezvousService.getAll(this.user.cabinetId).subscribe({
      next: (data) => {
        this.rendezvousList = data;
        console.log('RENDEZ-VOUS CHARGÉS:', this.rendezvousList.length);
      },
      error: (err) => console.error('Erreur chargement RDV:', err)
    });
  }

  loadFacturations(): void {
    if (!this.user.cabinetId) {
      console.warn('cabinetId non défini → factures non chargées');
      this.transactionData = [];
      this.filteredData = [];
      return;
    }

    // CORRECTION CRITIQUE : passer le cabinetId pour avoir les bonnes factures
    this.facturationService.getAll().subscribe({
      next: (data: Facturation[]) => {
        console.log('FACTURES CHARGÉES pour cabinet', this.user.cabinetId, ':', data);
        this.transactionData = data;
        this.filteredData = [...data];
      },
      error: (error) => {
        console.error('Erreur chargement facturations:', error);
        this.transactionData = [];
        this.filteredData = [];
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(facturation =>
        facturation.modePaiement?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): Facturation[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Modals classiques
  openAddModal() {
    this.selectedFacturation = null;
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.loadFacturations();
  }

  openEditModal(facturation: Facturation) {
    this.selectedFacturation = facturation;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedFacturation = null;
    this.loadFacturations();
  }

  openDeleteModal(facturation: Facturation) {
    this.selectedFacturation = facturation;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(deleted: boolean = false) {
    this.isDeleteModalOpen = false;
    this.selectedFacturation = null;
    if (deleted) this.loadFacturations();
  }

  openShowModal(facturation: Facturation) {
    this.selectedFacturation = facturation;
    this.isShowModalOpen = true;
  }

  closeShowModal() {
    this.isShowModalOpen = false;
    this.selectedFacturation = null;
  }

  // Modal Impression PDF
  openPrintModal(facturation: Facturation) {
    this.selectedFacturation = facturation;

    // Sécurité : si les données ne sont pas encore chargées, on attend un peu
    if (this.patients.length === 0 || this.rendezvousList.length === 0) {
      console.log('Données manquantes → rechargement avant impression');
      this.loadPatients();
      this.loadRendezVous();
      setTimeout(() => {
        this.isPrintModalOpen = true;
      }, 800);
    } else {
      this.isPrintModalOpen = true;
    }
  }

  closePrintModal() {
    this.isPrintModalOpen = false;
    this.selectedFacturation = null;
  }

  handleFilter() {
    console.log('Filter clicked');
  }
}