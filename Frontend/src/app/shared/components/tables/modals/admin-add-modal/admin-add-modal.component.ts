import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { AdminService, Admin } from '../../../../../../services/admin.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-add-modal',
  imports: [ButtonComponent,
      LabelComponent,ModalComponent,FormsModule,CommonModule], 
  templateUrl: './admin-add-modal.component.html',
})
export class AdminAddModalComponent {
  @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();

  admin: Admin = {
    nom: '',
    prenom: '',
    username: '',
    password: '',
    numTel: '',
    avatar: ''
  };
  selectedFile: File | null = null;
  previewUrl: string = '/images/user/default.png';
  isLoading: boolean = false;
  errorMessage: string = '';
  constructor(private adminService: AdminService) {}

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }
  handleSave() {
    // Validation
    if (!this.admin.nom || !this.admin.prenom || !this.admin.username  || !this.admin.numTel) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. Créer l'admin
    this.adminService.createAdmin(this.admin).subscribe({
      next: (createdAdmin) => {
        console.log('Admin créé:', createdAdmin);

        // 2. Upload l'avatar si un fichier est sélectionné
        if (this.selectedFile && createdAdmin.id) {
          this.adminService.uploadImage(createdAdmin.id, this.selectedFile).subscribe({
            next: (imageUrl) => {
              console.log('Image uploadée:', imageUrl);
              this.isLoading = false;
              this.closeAddModal();
            },
            error: (error) => {
              console.error('Erreur upload image:', error);
              this.isLoading = false;
              // L'admin est créé mais sans image
              this.closeAddModal();
            }
          });
        } else {
          // Pas d'image à uploader
          this.isLoading = false;
          this.closeAddModal();
        }
      },
      error: (error) => {
        console.error('Erreur création admin:', error);
        this.errorMessage = 'Erreur lors de la création de l\'admin';
        this.isLoading = false;
      }
    });
  }
  resetForm() {
    this.admin = {
      nom: '',
      prenom: '',
      username: '',
      numTel: '',
      avatar: ''
    };
    this.selectedFile = null;
    this.previewUrl = '';
    this.errorMessage = '';
  }
}


 
