import { PatientRestoreModalComponent } from '../modals/patient-restore-modal/patient-restore-modal.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { PatientService , Patient } from '../../../../../services/patient.service';

@Component({
  selector: 'app-historique-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    PatientRestoreModalComponent
  ],
  templateUrl: './historique-table.component.html',
  styles: ``
})
export class HistoriqueTableComponent implements OnInit{

  transactionData: Patient[] = [];
  filteredData: Patient[] = [];
  selectedPatient: Patient | null = null;
  searchTerm: string = '';

  currentPage = 1;
  itemsPerPage = 6;


  isRestoreModalOpen = false;


  constructor(
    public modal: ModalService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAllNoActif().subscribe({
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

  openRestoreModal(patient: Patient) { 
    this.selectedPatient = patient;
    this.isRestoreModalOpen = true; 
  }
 closeDeleteModal(restored: boolean = false) { 
  this.isRestoreModalOpen = false;
  this.selectedPatient = null;

  if (restored) {
    this.loadPatients(); // 🔄 reload automatique
  }
}

 
  handleFilter() {
    console.log('Filter clicked');
  }
}
