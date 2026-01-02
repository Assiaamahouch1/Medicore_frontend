import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { FacturationService , Facturation } from '../../../../../services/facturation.service';
import { FacturationAddModalComponent } from './../modals/facturation-add-modal/facturation-add-modal.component';
import { FacturationEditModalComponent } from './../modals/facturation-edit-modal/facturation-edit-modal.component';
import { FacturationDeleteModalComponent } from './../modals/facturation-delete-modal/facturation-delete-modal.component';
import { FacturationShowModalComponent } from './../modals/facturation-show-modal/facturation-show-modal.component';


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
    FacturationShowModalComponent
  ],
  templateUrl: './facturation-table.component.html',
  styles: ``
})
export class FacturationTableComponent implements OnInit{

  transactionData: Facturation[] = [];
  filteredData: Facturation[] = [];
  selectedFacturation: Facturation | null = null;
  searchTerm: string = '';

  currentPage = 1;
  itemsPerPage = 6;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

  constructor(
    public modal: ModalService,
    private facturationService: FacturationService
  ) {}

  ngOnInit() {
    this.loadFacturations();
  }

  loadFacturations(): void {
    this.facturationService.getAll().subscribe({
      next: (data: Facturation[]) => {
        this.transactionData = data;
        this.filteredData = [...data];
      },
      error: (error) => console.error('Erreur chargement facturations:', error)
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(facturation =>
        facturation.modePaiement?.toLowerCase().includes(term)       );
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
    this.selectedFacturation= null;
    if (deleted) this.loadFacturations(); 
  }

  openShowModal(facturation: Facturation) { 
    this.selectedFacturation = facturation;
    this.isShowModalOpen = true; 
  }
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedFacturation= null;
  }

  handleFilter() {
    console.log('Filter clicked');
  }
}
