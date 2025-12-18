import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  imports: [
    CommonModule,
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
  constructor(public modal: ModalService,
    private adminService: AdminService
  ) {}
  

  /*isAddModalOpen  = false;
  isEditModalOpen  = false
  isDeleteModalOpen  = false;*/
  isShowModalOpen  = false;

  /*openAddModal() { 
    this.selectedAdmin = null;
    this.isAddModalOpen = true; 
  }
  
  closeAddModal() { 
    this.isAddModalOpen = false;
    this.loadAdmins(); // Recharger après ajout
  }

  openEditModal(admin: Admin) { 
    this.selectedAdmin = admin;
    this.isEditModalOpen = true; 
  }
  
  closeEditModal() { 
    this.isEditModalOpen = false;
    this.selectedAdmin = null;
    this.loadAdmins(); // Recharger après modification
  }

  openDeleteModal(admin: Admin) { 
    this.selectedAdmin = admin;
    this.isDeleteModalOpen = true; 
  }
  
  closeDeleteModal(deleted: boolean = false) { 
    this.isDeleteModalOpen = false;
    this.selectedAdmin = null;
    if (deleted) {
      this.loadAdmins(); // Recharger après suppression
    }
  }*/

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
        console.log('Données brutes du backend:', data); // DEBUG
        
        this.transactionData = data.map((admin: Admin) => {
          console.log('Avatar brut:', admin.avatar); // DEBUG
          
          const avatarUrl = admin.avatar 
            ? this.adminService.getImageUrl(admin.avatar)
            : '/images/user/default.jpg';
            
          console.log('Avatar URL final:', avatarUrl); // DEBUG
          
          return {
            ...admin,
            avatar: avatarUrl
          };
        });
      },
      error: (error: any) => {
        console.error('Erreur chargement admins:', error);
      }
    });
  }

  currentPage = 1;
  itemsPerPage = 6;

  get totalPages(): number {
    return Math.ceil(this.transactionData.length / this.itemsPerPage);
  }

  get currentItems(): Admin[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.transactionData.slice(start, start + this.itemsPerPage);
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
