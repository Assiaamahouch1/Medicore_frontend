import { RendezvousDeleteModalComponent } from './../modals/rendezvous-delete-modal/rendezvous-delete-modal.component';
import { RendezvousEditModalComponent } from './../modals/rendezvous-edit-modal/rendezvous-edit-modal.component';
import { RendezvousShowModalComponent } from './../modals/rendezvous-show-modal/rendezvous-show-modal.component';
import { RendezvousAddModalComponent } from './../modals/rendezvous-add-modal/rendezvous-add-modal.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { PatientService, Patient } from '../../../../../services/patient.service';
import { RendezVous, RendezvousService } from '../../../../../services/rendezvous.service';
import { RendezvousPrintModalComponent } from '../modals/rendezvous-print-modal/rendezvous-print-modal.component';
import { RendezvousCalendarModalComponent } from '../modals/rendezvous-calendar-modal/rendezvous-calendar-modal.component';
@Component({
  selector: 'app-rendezvous-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    RendezvousCalendarModalComponent,
    RendezvousAddModalComponent,
    RendezvousDeleteModalComponent,
    RendezvousEditModalComponent,
    RendezvousShowModalComponent,
    RendezvousPrintModalComponent
  ],
  templateUrl: './rendezvous-table.component.html',
  styles: ``
})
export class RendezvousTableComponent implements OnInit {
  patients: Patient[] = [];
  transactionData: RendezVous[] = [];
  filteredData: RendezVous[] = [];
  selectedRendezvous: RendezVous | null = null;
  searchTerm: string = '';
  isPrintModalOpen = false;
  isCalendarModalOpen = false;

  // Pour le sélecteur de date
  dateInput: string = '';           // Valeur de l'input date (YYYY-MM-DD)
  selectedDate: string | null = null; // Date actuellement filtrée

  currentPage = 1;
  itemsPerPage = 6;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

  constructor(
    public modal: ModalService,
    private rendezvousservice: RendezvousService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.loadRendezVous();
    this.loadPatients();
    this.showAll(); // Par défaut : tout afficher
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data: Patient[]) => this.patients = data,
      error: (err) => console.error('Erreur chargement patients:', err)
    });
  }
  

  loadRendezVous(): void {
    this.rendezvousservice.getAll().subscribe({
      next: (data: RendezVous[]) => {
        this.transactionData = data;
        this.applyCurrentFilter();
      },
      error: (error) => console.error('Erreur chargement rendez vous:', error)
    });
  }

  // Afficher tous les RDV
  showAll() {
    this.selectedDate = null;
    this.dateInput = '';
    this.applyCurrentFilter();
  }
  openPrintModal(rendezvous: RendezVous) {
  this.selectedRendezvous = rendezvous;
  this.isPrintModalOpen = true;
}

closePrintModal() {
  this.isPrintModalOpen = false;
  this.selectedRendezvous = null;
}

  // Sélectionner aujourd'hui
  selectToday() {
    const today = new Date();
    this.dateInput = today.toISOString().split('T')[0];
    this.onDateChange();
  }

  // Quand on change la date dans l'input
  onDateChange() {
    this.selectedDate = this.dateInput || null;
    this.applyCurrentFilter();
  }

  // Applique le filtre de date + recherche
  private applyCurrentFilter() {
    let data = this.transactionData;

    if (this.selectedDate) {
      data = this.transactionData.filter(rdv => {
        if (!rdv.dateRdv) return false;
        const rdvDate = new Date(rdv.dateRdv);
        return rdvDate.toISOString().split('T')[0] === this.selectedDate;
      });
    }

    this.filteredData = [...data];
    this.onSearchChange(); // Applique la recherche par-dessus
    this.currentPage = 1;
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = this.filteredData; // Garde le filtre de date
    } else {
      this.filteredData = this.filteredData.filter(rdv => {
        const patient = this.patients.find(p => p.id === rdv.patientId);
        const fullName = patient ? `${patient.nom} ${patient.prenom}`.toLowerCase() : '';
        const dateStr = rdv.dateRdv ? new Date(rdv.dateRdv).toLocaleDateString() : '';
        return fullName.includes(term) || dateStr.includes(term);
      });
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): RendezVous[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  getPatientName(patientId: string | number | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.nom} ${patient.prenom}` : 'N/A';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openAddModal() { 
    this.selectedRendezvous = null;
    this.isAddModalOpen = true; 
  }
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadRendezVous(); 
  }
  openCalendarModal() {
  this.isCalendarModalOpen = true;
}

closeCalendarModal() {
  this.isCalendarModalOpen = false;
}

openRdvFromCalendar(rdv: RendezVous) {
  this.selectedRendezvous = rdv;
  this.isCalendarModalOpen = false;
  // Optionnel : ouvrir le modal de détails ou d'impression
  this.openPrintModal(rdv); // ou openShowModal(rdv)
}

  openEditModal(rendezvous: RendezVous) { 
    this.selectedRendezvous = rendezvous;
    this.isEditModalOpen = true; 
  }
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedRendezvous = null;
    this.loadRendezVous(); 
  }

  openDeleteModal(rendezvous: RendezVous) { 
    this.selectedRendezvous = rendezvous;
    this.isDeleteModalOpen = true; 
  }
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedRendezvous = null;
    if (deleted) this.loadRendezVous(); 
  }

  openShowModal(rendezvous: RendezVous) { 
    this.selectedRendezvous = rendezvous;
    this.isShowModalOpen = true; 
  }
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedRendezvous = null;
  }
}