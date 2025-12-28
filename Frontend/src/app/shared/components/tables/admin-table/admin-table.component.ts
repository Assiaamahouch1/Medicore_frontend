import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { AdminAddModalComponent } from '../modals/admin-add-modal/admin-add-modal.component';
import { AdminEditModalComponent } from '../modals/admin-edit-modal/admin-edit-modal.component';
import { AdminDeleteModalComponent } from '../modals/admin-delete-modal/admin-delete-modal.component';
import { AdminShowModalComponent } from '../modals/admin-show-modal/admin-show-modal.component';
import { AdminService, Admin } from '../../../../../services/admin.service';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
    AdminAddModalComponent,
    AdminEditModalComponent,
    AdminDeleteModalComponent,
    AdminShowModalComponent
  ],
  templateUrl: './admin-table.component.html',
  styles: ``
})
export class AdminTableComponent implements OnInit {
  
  transactionData: Admin[] = [];
  selectedAdmin: Admin | null = null;
  filteredData: Admin[] = [];
  searchTerm: string = '';
  
  avatarUrls: Map<number, string> = new Map();
  defaultAvatar = '/images/user/default.png';

  constructor(
    public modal: ModalService,
    private adminService: AdminService
  ) {}

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

  openAddModal() { 
    this.selectedAdmin = null;
    this.isAddModalOpen = true; 
  }
  
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadAdmins(); 
  }

  openEditModal(admin: Admin) { 
    this.selectedAdmin = admin;
    this.isEditModalOpen = true; 
  }
  
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedAdmin = null;
    this.loadAdmins(); 
  }

  openDeleteModal(admin: Admin) { 
    this.selectedAdmin = admin;
    this.isDeleteModalOpen = true; 
  }
  
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedAdmin = null;
    if (deleted) {
      this.loadAdmins(); 
    }
  }

  openShowModal(admin: Admin) { 
    this.selectedAdmin = admin;
    this.isShowModalOpen = true; 
  }
  
  closeShowModal() { 
    this.isShowModalOpen = false;
    this.selectedAdmin = null;
  }

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAllAdmins().subscribe({
      next: (data: Admin[]) => {
        console.log('Données brutes du backend:', data);
        
        this.transactionData = data;
        this.filteredData = [...this.transactionData];
        
        data.forEach(admin => {
          if (admin.id) {
            this.loadAdminAvatar(admin.id, admin.avatar);
          }
        });
      },
      error: (error: any) => {
        console.error('Erreur chargement admins:', error);
      }
    });
  }

  loadAdminAvatar(adminId: number, avatarFilename?: string): void {
    if (!avatarFilename) {
      this.avatarUrls.set(adminId, this.defaultAvatar);
      return;
    }

    this.adminService.getAvatar(avatarFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatarUrls.set(adminId, reader.result as string);
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error(`Erreur chargement avatar admin ${adminId}:`, err);
        this.avatarUrls.set(adminId, this.defaultAvatar);
      }
    });
  }

  getAdminAvatar(adminId?: number): string {
    if (!adminId) return this.defaultAvatar;
    return this.avatarUrls.get(adminId) || this.defaultAvatar;
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredData = [...this.transactionData];
    } else {
      this.filteredData = this.transactionData.filter(admin => 
        admin.nom?.toLowerCase().includes(term) ||
        admin.prenom?.toLowerCase().includes(term) ||
        admin.username?.toLowerCase().includes(term) ||
        admin.numTel?.toLowerCase().includes(term)
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

  get currentItems(): Admin[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleViewMore(item: Admin) {
    console.log('View More:', item);
  }

  handleDelete(item: Admin) {
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