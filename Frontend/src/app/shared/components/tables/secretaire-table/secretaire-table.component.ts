import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { SecretaireAddModalComponent } from '../modals/secretaire-add-modal/secretaire-add-modal.component';
import { SecretaireEditModalComponent } from '../modals/secretaire-edit-modal/secretaire-edit-modal.component';
import { SecretaireDeleteModalComponent } from '../modals/secretaire-delete-modal/secretaire-delete-modal.component';
import { SecretaireShowModalComponent } from '../modals/secretaire-show-modal/secretaire-show-modal.component';
import { SecretaireService, Secretaire } from '../../../../../services/secretaire.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-secretaire-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    SecretaireAddModalComponent,
    SecretaireEditModalComponent,
    SecretaireDeleteModalComponent,
    SecretaireShowModalComponent
  ],
  templateUrl: './secretaire-table.component.html',
  styles: ``
})
export class SecretaireTableComponent implements OnInit {
  
  transactionData: Secretaire[] = [];
  selectedSecretaire: Secretaire | null = null;
  filteredData: Secretaire[] = [];
  searchTerm: string = '';
  
  avatarUrls: Map<number, string> = new Map();
  defaultAvatar = '/images/user/default.png';

  constructor(
    public modal: ModalService,
    private secretaireService: SecretaireService,
    private authService: AuthService
  ) {}

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

  openAddModal() { 
    this.selectedSecretaire = null;
    this.isAddModalOpen = true; 
  }
  
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadSecretaires(); 
  }

  openEditModal(secretaire: Secretaire) { 
    this.selectedSecretaire = secretaire;
    this.isEditModalOpen = true; 
  }
  
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedSecretaire = null;
    this.loadSecretaires(); 
  }

  openDeleteModal(secretaire: Secretaire) { 
    this.selectedSecretaire = secretaire;
    this.isDeleteModalOpen = true; 
  }
  
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedSecretaire = null;
    if (deleted) {
      this.loadSecretaires(); 
    }
  }

  openShowModal(secretaire: Secretaire) { 
    this.selectedSecretaire = secretaire;
    this.isShowModalOpen = true; 
  }
  
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedSecretaire = null;
  }
  cabinetId?: number;
  ngOnInit() {
  this.authService.getCurrentAuth().subscribe({
    next: (medecin) => {
      this.cabinetId = medecin.cabinetId;
      this.loadSecretaires();
    },
    error: (err) => console.error('Erreur récupération médecin:', err)
  });
}

  loadSecretaires(): void {
  // Récupérer l'utilisateur courant
  this.authService.getCurrentAuth().subscribe({
    next: (medecin) => {
      const cabinetId = medecin.cabinetId;
      
      // Récupérer toutes les secrétaires
      this.secretaireService.getAllSecretaires().subscribe({
        next: (data: Secretaire[]) => {
          // Filtrer uniquement celles qui ont le même cabinetId
          this.transactionData = data.filter(sec => sec.cabinetId === cabinetId);
          this.filteredData = [...this.transactionData];

          // Charger les avatars
          this.transactionData.forEach(secretaire => {
            if (secretaire.id) {
              this.loadSecretaireAvatar(secretaire.id, secretaire.avatar);
            }
          });
        },
        error: (err) => console.error('Erreur chargement secretaires:', err)
      });
    },
    error: (err) => console.error('Erreur récupération médecin:', err)
  });
}


  loadSecretaireAvatar(secretaireId: number, avatarFilename?: string): void {
    if (!avatarFilename) {
      this.avatarUrls.set(secretaireId, this.defaultAvatar);
      return;
    }

    this.secretaireService.getAvatar(avatarFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatarUrls.set(secretaireId, reader.result as string);
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error(`Erreur chargement avatar secretaire ${secretaireId}:`, err);
        this.avatarUrls.set(secretaireId, this.defaultAvatar);
      }
    });
  }

  getSecretaireAvatar(secretaireId?: number): string {
    if (!secretaireId) return this.defaultAvatar;
    return this.avatarUrls.get(secretaireId) || this.defaultAvatar;
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(secretaire => 
        secretaire.nom?.toLowerCase().includes(term) ||
        secretaire.prenom?.toLowerCase().includes(term) ||
        secretaire.username?.toLowerCase().includes(term) ||
        secretaire.numTel?.toLowerCase().includes(term)
      );
    }
    
    this.currentPage = 1;
    console.log('Recherche:', term, 'Résultats:', this.filteredData.length);
  }

  currentPage = 1;
  itemsPerPage = 6;

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): Secretaire[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleViewMore(item: Secretaire) {
    console.log('View More:', item);
  }

  handleDelete(item: Secretaire) {
    console.log('Delete:', item);
  }

  handleFilter() {
    console.log('Filter clicked');
  }

  handleSeeAll() {
    console.log('See all clicked');
  }

  handleSave() {
    console.log('Saving changes...');
  }
}