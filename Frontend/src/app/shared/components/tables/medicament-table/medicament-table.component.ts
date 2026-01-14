import { Component, OnInit } from '@angular/core';
import { Medicament } from '../../../../../services/medicament.service'; // Assure-toi que le chemin est correct
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component'; // Assure-toi que le chemin est correct
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component'; // Assure-toi que le chemin est correct
import { ModalService } from '../../../services/modal.service'; // Assure-toi que le chemin est correct
import { MedicamentService } from '../../../../../services/medicament.service'; // Assure-toi que le chemin est correct
import { MedicamentDeleteModalComponent } from './../modals/medicament-delete-modal/medicament-delete-modal.component'; // Assure-toi que le chemin est correct

@Component({
  selector: 'app-medicament-table',
  standalone: true, // Si tu utilises standalone components (Angular 17+)
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    MedicamentDeleteModalComponent
  ],
  templateUrl: './medicament-table.component.html',
  // Ou si tu préfères inline template, mais comme tu l'as en fichier, garde templateUrl
})
export class MedicamentTableComponent implements OnInit {
  medicament: Medicament = {
    nom: '',
    description: '',
    atcCode: '',
    forme: '',
    dosageUnite: '',
  };

  transactionData: Medicament[] = [];
  filteredData: Medicament[] = [];
  selectedMedicament: Medicament | null = null;
  searchTerm: string = '';
  medicaments: Medicament[] = []; // Inutilisé ? Peut-être à supprimer si non nécessaire
  isPrintModalOpen = false; // Inutilisé dans le code fourni
  currentPage = 1;
  itemsPerPage = 6;
  isDeleteModalOpen = false;
  isLoading = true; // Ajouté pour l'état de chargement

  constructor(
    public modal: ModalService,
    private medicamentService: MedicamentService
  ) {}

  ngOnInit(): void {
    this.loadMedicaments();
  }

  loadMedicaments(): void {
    this.isLoading = true;
    this.medicamentService.getAll().subscribe({
      next: (data: Medicament[]) => {
        this.transactionData = data;
        this.filteredData = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement medicaments:', error);
        this.transactionData = [];
        this.filteredData = [];
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(med =>
        med.nom?.toLowerCase().includes(term) ||
        med.atcCode?.toLowerCase().includes(term) ||
        med.description?.toLowerCase().includes(term) ||
        med.forme?.toLowerCase().includes(term) ||
        med.dosageUnite?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): Medicament[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDeleteModal(medicament: Medicament) {
    this.selectedMedicament = medicament;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(deleted: boolean = false) {
    this.isDeleteModalOpen = false;
    this.selectedMedicament = null;
    if (deleted) this.loadMedicaments();
  }

  handleFilter() {
    console.log('Filter clicked');
    // Implémente la logique de filtre avancé si nécessaire
  }
}