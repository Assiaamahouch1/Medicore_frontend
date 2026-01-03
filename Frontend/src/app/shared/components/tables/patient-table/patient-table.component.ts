import { PatientShowModalComponent } from './../modals/patient-show-modal/patient-show-modal.component';
import { PatientEditModalComponent } from './../modals/patient-edit-modal/patient-edit-modal.component';
import { PatientDeleteModalComponent } from './../modals/patient-delete-modal/patient-delete-modal.component';
import { PatientAddModalComponent } from './../modals/patient-add-modal/patient-add-modal.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { PatientService , Patient } from '../../../../../services/patient.service';

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
    PatientShowModalComponent
  ],
  templateUrl: './patient-table.component.html',
  styles: ``
})
export class PatientTableComponent implements OnInit{

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

  constructor(
    public modal: ModalService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data: Patient[]) => {
        this.transactionData = data;
        this.filteredData = [...data];
      },
      error: (error) => console.error('Erreur chargement patients:', error)
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(patient =>
        patient.nom?.toLowerCase().includes(term) ||
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

  openAddModal() { 
    this.selectedPatient = null;
    this.isAddModalOpen = true; 
  }
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadPatients(); 
  }

  openEditModal(patient: Patient) { 
    this.selectedPatient = patient;
    this.isEditModalOpen = true; 
  }
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedPatient = null;
    this.loadPatients(); 
  }

  openDeleteModal(patient: Patient) { 
    this.selectedPatient = patient;
    this.isDeleteModalOpen = true; 
  }
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedPatient= null;
    if (deleted) this.loadPatients(); 
  }

  openShowModal(patient: Patient) { 
    this.selectedPatient = patient;
    this.isShowModalOpen = true; 
  }
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedPatient= null;
  }

  handleFilter() {
    console.log('Filter clicked');
  }
}
