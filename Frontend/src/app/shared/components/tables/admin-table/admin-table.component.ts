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
export class AdminTableComponent implements OnInit{

  
  transactionData: Admin[] = [];
  selectedAdmin: Admin | null = null;
  filteredData: Admin[] = [];
  searchTerm: string = '';
  constructor(public modal: ModalService,
    private adminService: AdminService
  ) {}
  

  isAddModalOpen  = false;
  isEditModalOpen  = false
  isDeleteModalOpen  = false;
  isShowModalOpen  = false;

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
        
        this.transactionData = data.map((admin: Admin) => {
          if (admin.avatar && admin.avatar.startsWith('http')) {
            this.adminService.getAvatar(admin.avatar).subscribe({
              next: (blob) => {
                admin.avatar = URL.createObjectURL(blob);
              },
              error: (err) => {
                console.error('Erreur chargement image:', err);
                admin.avatar = '/images/user/default.png';
              }
            });
          } else {
            admin.avatar = '/images/user/default.png';
          }
          return admin;
        });
        
        this.filteredData = [...this.transactionData];
      },
      error: (error: any) => {
        console.error('Erreur chargement admins:', error);
      }
    });
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
    // logic here
    console.log('View More:', item);
  }

  handleDelete(item: Admin) {
    // logic here
    console.log('Delete:', item);
  }

  handleFilter() {
    console.log('Filter clicked');
    // Add your filter logic here
  }

  handleSeeAll() {
    console.log('See all clicked');
    // Add your see all logic here
  }
  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    //this.modal.closeModal();
  }
  
}
