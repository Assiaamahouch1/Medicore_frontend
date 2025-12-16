import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { AdminAddModalComponent } from '../modals/admin-add-modal/admin-add-modal.component';
import { AdminEditModalComponent } from '../modals/admin-edit-modal/admin-edit-modal.component';
import { AdminDeleteModalComponent } from '../modals/admin-delete-modal/admin-delete-modal.component';
import { AdminShowModalComponent } from '../modals/admin-show-modal/admin-show-modal.component';


interface Transaction {
  image: string;
  nom: string;
  prenom: string;
  numTel: string;
  email: string;
}

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
export class AdminTableComponent {

  constructor(public modal: ModalService) {}
    
  isAddModalOpen  = false;
  openAddModal() { this.isAddModalOpen  = true; }
  closeAddModal() { this.isAddModalOpen  = false; }

  isEditModalOpen  = false;
  openEditModal() { this.isEditModalOpen  = true; }
  closeEditModal() { this.isEditModalOpen  = false; }

  isDeleteModalOpen  = false;
  openDeleteModal() { this.isDeleteModalOpen  = true; }
  closeDeleteModal() { this.isDeleteModalOpen  = false; }

  isShowModalOpen  = false;
  openShowModal() { this.isShowModalOpen  = true; }
  closeShowModal() { this.isShowModalOpen  = false; }

  user = {
    firstName: 'Musharof',
    lastName: 'Chowdhury',
    email: 'randomuser@pimjo.com',
    phone: '+09 363 398 46',
    bio: 'Team Manager',
    avatar: '/images/user/avatar.jpg',
    social: {
      facebook: 'https://www.facebook.com/PimjoHQ',
      x: 'https://x.com/PimjoHQ',
      linkedin: 'https://www.linkedin.com/company/pimjo',
      instagram: 'https://instagram.com/PimjoHQ',
    },
  };

  transactionData: Transaction[] = [
  {
    image: "/images/user/user-01.jpg",
    nom: "Dupont",
    prenom: "Jean",
    numTel: "+33 6 12 34 56 78",
    email: "jean.dupont@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Martin",
    prenom: "Claire",
    numTel: "+33 6 98 76 54 32",
    email: "claire.martin@example.com",
  },
  {
    image: "/images/user/user-02.jpg",
    nom: "Nguyen",
    prenom: "Thi",
    numTel: "+33 7 11 22 33 44",
    email: "thi.nguyen@example.com",
  },
  {
    image: "/images/user/user-08.jpg",
    nom: "Ahmed",
    prenom: "Omar",
    numTel: "+33 6 55 66 77 88",
    email: "omar.ahmed@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Dupont",
    prenom: "Jean",
    numTel: "+33 6 12 34 56 78",
    email: "jean.dupont@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Martin",
    prenom: "Claire",
    numTel: "+33 6 98 76 54 32",
    email: "claire.martin@example.com",
  },
  {
    image: "/images/user/user-02.jpg",
    nom: "Nguyen",
    prenom: "Thi",
    numTel: "+33 7 11 22 33 44",
    email: "thi.nguyen@example.com",
  },
  {
    image: "/images/user/user-08.jpg",
    nom: "Ahmed",
    prenom: "Omar",
    numTel: "+33 6 55 66 77 88",
    email: "omar.ahmed@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Dupont",
    prenom: "Jean",
    numTel: "+33 6 12 34 56 78",
    email: "jean.dupont@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Martin",
    prenom: "Claire",
    numTel: "+33 6 98 76 54 32",
    email: "claire.martin@example.com",
  },
  {
    image: "/images/user/user-02.jpg",
    nom: "Nguyen",
    prenom: "Thi",
    numTel: "+33 7 11 22 33 44",
    email: "thi.nguyen@example.com",
  },
  {
    image: "/images/user/user-08.jpg",
    nom: "Ahmed",
    prenom: "Omar",
    numTel: "+33 6 55 66 77 88",
    email: "omar.ahmed@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Dupont",
    prenom: "Jean",
    numTel: "+33 6 12 34 56 78",
    email: "jean.dupont@example.com",
  },
  {
    image: "/images/user/user-01.jpg",
    nom: "Martin",
    prenom: "Claire",
    numTel: "+33 6 98 76 54 32",
    email: "claire.martin@example.com",
  },
  {
    image: "/images/user/user-02.jpg",
    nom: "Nguyen",
    prenom: "Thi",
    numTel: "+33 7 11 22 33 44",
    email: "thi.nguyen@example.com",
  },
  {
    image: "/images/user/user-08.jpg",
    nom: "Ahmed",
    prenom: "Omar",
    numTel: "+33 6 55 66 77 88",
    email: "omar.ahmed@example.com",
  },
  ];

  currentPage = 1;
  itemsPerPage = 6;

  get totalPages(): number {
    return Math.ceil(this.transactionData.length / this.itemsPerPage);
  }

  get currentItems(): Transaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.transactionData.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleViewMore(item: Transaction) {
    // logic here
    console.log('View More:', item);
  }

  handleDelete(item: Transaction) {
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
    this.modal.closeModal();
  }
  onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = () => {
      this.user.avatar = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Ici tu peux aussi stocker le fichier pour l’envoyer au backend
    // this.selectedAvatarFile = file;
  }
}
}
