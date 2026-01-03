
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { CabinetService } from '../../../../../services/cabinet.service';
import { Cabinet, SubscriptionStatus } from '../../../../models/cabinet.model';
import { CabinetAddModalComponent } from '../modals/cabinet-add-modal/cabinet-add-modal.component';
import { CabinetEditModalComponent } from '../modals/cabinet-edit-modal/cabinet-edit-modal.component';
import { CabinetDeleteModalComponent } from '../modals/cabinet-delete-modal/cabinet-delete-modal.component';
import { CabinetShowModalComponent } from '../modals/cabinet-show-modal/cabinet-show-modal.component';
import { CabinetStatusModalComponent } from '../modals/cabinet-status-modal/cabinet-status-modal.component';

@Component({
  selector: 'app-cabinet-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    CabinetAddModalComponent,
    CabinetEditModalComponent,
    CabinetDeleteModalComponent,
    CabinetShowModalComponent,
    CabinetStatusModalComponent
  ],
  templateUrl: './cabinet-table.component.html',
  styles: ``
})
export class CabinetTableComponent implements OnInit {
  
  cabinetData: Cabinet[] = [];
  selectedCabinet: Cabinet | null = null;
  filteredData: Cabinet[] = [];
  searchTerm: string = '';
  
  logoUrls: Map<number, string> = new Map();
  defaultLogo = '/images/logo/Medicore.png';

  constructor(private cabinetService: CabinetService) {}

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;
  isStatusModalOpen = false;

  openAddModal() { 
    this.selectedCabinet = null;
    this.isAddModalOpen = true; 
  }
  
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadCabinets(); 
  }

  openEditModal(cabinet: Cabinet) { 
    this.selectedCabinet = cabinet;
    this.isEditModalOpen = true; 
  }
  
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedCabinet = null;
    this.loadCabinets(); 
  }

  openDeleteModal(cabinet: Cabinet) { 
    this.selectedCabinet = cabinet;
    this.isDeleteModalOpen = true; 
  }
  
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedCabinet = null;
    if (deleted) {
      this.loadCabinets(); 
    }
  }

  openShowModal(cabinet: Cabinet) { 
    this.selectedCabinet = cabinet;
    this.isShowModalOpen = true; 
  }
  
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedCabinet = null;
  }

  openStatusModal(cabinet: Cabinet) { 
    this.selectedCabinet = cabinet;
    this.isStatusModalOpen = true; 
  }
  
  closeStatusModal(updated: boolean = false) { 
    this.isStatusModalOpen = false;
    this.selectedCabinet = null;
    if (updated) {
      this.loadCabinets(); 
    }
  }

  ngOnInit() {
    this.loadCabinets();
  }

  loadCabinets(): void {
    this.cabinetService.getAllCabinets().subscribe({
      next: (response: any) => {
        console.log('Cabinets chargés:', response);
        
        // Le backend retourne un objet Page, extraire le content
        const rawData = response.content ?? response ?? [];
        
        // Normaliser les données (le backend peut retourner camelCase ou snake_case)
        this.cabinetData = Array.isArray(rawData) 
          ? rawData.map((c: any) => this.normalizeCabinet(c))
          : [];
        this.filteredData = [...this.cabinetData];
        
        this.cabinetData.forEach(cabinet => {
          if (cabinet.id) {
            this.loadCabinetLogo(cabinet.id, cabinet.logo);
          }
        });
      },
      error: (error: any) => {
        console.error('Erreur chargement cabinets:', error);
        this.cabinetData = [];
        this.filteredData = [];
      }
    });
  }

  // Normalise les champs du cabinet (supporte camelCase et snake_case du backend)
  private normalizeCabinet(c: any): Cabinet {
    return {
      id: c.id,
      logo: c.logo,
      nom: c.nom,
      specialite: c.specialite,
      adresse: c.adresse,
      tel: c.tel,
      // Gère les deux formats : camelCase (Spring) et snake_case
      service_actif: c.service_actif ?? c.serviceActif ?? false,
      date_expiration_service: c.date_expiration_service ?? c.dateExpirationService ?? null
    };
  }

  loadCabinetLogo(cabinetId: number, logoFilename?: string): void {
    if (!logoFilename) {
      this.logoUrls.set(cabinetId, this.defaultLogo);
      return;
    }

    this.cabinetService.getLogo(logoFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.logoUrls.set(cabinetId, reader.result as string);
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error(`Erreur chargement logo cabinet ${cabinetId}:`, err);
        this.logoUrls.set(cabinetId, this.defaultLogo);
      }
    });
  }

  getCabinetLogo(cabinetId?: number): string {
    if (!cabinetId) return this.defaultLogo;
    return this.logoUrls.get(cabinetId) || this.defaultLogo;
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredData = [...this.cabinetData];
    } else {
      this.filteredData = this.cabinetData.filter(cabinet => 
        cabinet.nom?.toLowerCase().includes(term) ||
        cabinet.specialite?.toLowerCase().includes(term) ||
        cabinet.adresse?.toLowerCase().includes(term) ||
        cabinet.tel?.toLowerCase().includes(term)
      );
    }
    
    this.currentPage = 1;
  }

  getStatusBadgeClass(cabinet: Cabinet): string {
    if (cabinet.service_actif) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  getExpirationStatus(cabinet: Cabinet): { class: string; text: string } {
    if (!cabinet.date_expiration_service) {
      return { class: 'text-gray-500', text: 'Non défini' };
    }
    
    const expDate = new Date(cabinet.date_expiration_service);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { class: 'text-red-600 dark:text-red-400', text: 'Expiré' };
    } else if (diffDays <= 30) {
      return { class: 'text-orange-600 dark:text-orange-400', text: `${diffDays} jours` };
    }
    return { class: 'text-green-600 dark:text-green-400', text: `${diffDays} jours` };
  }

  currentPage = 1;
  itemsPerPage = 6;

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): Cabinet[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleFilter() {
    console.log('Filter clicked');
  }
}
