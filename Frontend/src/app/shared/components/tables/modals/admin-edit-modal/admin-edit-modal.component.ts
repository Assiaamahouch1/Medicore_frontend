import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { AdminService, Admin } from '../../../../../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-edit-modal',
  imports: [
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './admin-edit-modal.component.html',
})
export class AdminEditModalComponent {
  @Input() isEditModalOpen: boolean = false; 
  @Input() admin: Admin | null = null;
  @Output() close = new EventEmitter<void>();

  editedAdmin: Admin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    avatar: ''
  };

  selectedFile: File | null = null;
  previewUrl: string = '/images/user/default.png';
  isLoading: boolean = false;
  errorMessage: string = '';

  avatarDataUrl: string = '/images/user/default.png';
  defaultAvatar = '/images/user/default.png';

  constructor(private adminService: AdminService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['admin'] && this.admin) {
      this.editedAdmin = { ...this.admin };
      this.loadAvatar();
      this.selectedFile = null;
      this.errorMessage = '';
    }
  }
  loadAvatar(): void {
    if (!this.admin?.avatar) {
      this.previewUrl = this.defaultAvatar;
      return;
    }

    this.adminService.getAvatar(this.admin.avatar).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
          console.log('✅ Avatar chargé pour le modal edit');
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('❌ Erreur chargement avatar edit modal:', err);
        this.previewUrl = this.defaultAvatar;
      }
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const originalFile = input.files[0];

      console.log('📁 Fichier original:', {
        nom: originalFile.name,
        type: originalFile.type,
        taille: (originalFile.size / 1024).toFixed(2) + ' KB'
      });

      // Compresse l'image
      this.compressImage(originalFile).then(compressedFile => {
        this.selectedFile = compressedFile;

        console.log('✅ Fichier compressé:', {
          nom: compressedFile.name,
          type: compressedFile.type,
          taille: (compressedFile.size / 1024).toFixed(2) + ' KB'
        });

        // Prévisualisation
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  }

  compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Erreur compression'));
              }
            },
            'image/jpeg',
            0.7
          );
        };

        img.onerror = () => reject(new Error('Erreur chargement image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });
  }

  closeEditModal() {
    this.resetForm();
    this.close.emit();
  }

  handleSave() {
    // Validation
    if (!this.editedAdmin.nom || !this.editedAdmin.prenom || 
        !this.editedAdmin.username || !this.editedAdmin.numTel) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    if (!this.editedAdmin.id) {
      this.errorMessage = 'ID admin manquant';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. Mettre à jour les infos de l'admin
    this.adminService.updateAdmin(this.editedAdmin.id, this.editedAdmin).subscribe({
      next: (updatedAdmin) => {
        console.log('✅ Admin mis à jour:', updatedAdmin);

        // 2. Upload l'avatar si un nouveau fichier est sélectionné
        if (this.selectedFile && updatedAdmin.id) {
          console.log('📤 Upload nouvelle image pour admin ID:', updatedAdmin.id);

          this.adminService.uploadImage(updatedAdmin.id, this.selectedFile).subscribe({
            next: (imageUrl) => {
              console.log('✅ Image uploadée:', imageUrl);
              this.isLoading = false;
              this.closeEditModal();
            },
            error: (error) => {
              console.error('❌ Erreur upload image:', error);
              this.errorMessage = `Erreur upload: ${error.status || 'Connexion perdue'}`;
              this.isLoading = false;
              
              // L'admin est mis à jour quand même
              setTimeout(() => this.closeEditModal(), 2000);
            }
          });
        } else {
          // Pas de nouvelle image
          this.isLoading = false;
          this.closeEditModal();
        }
      },
      error: (error) => {
        console.error('❌ Erreur modification admin:', error);
        this.errorMessage = 'Erreur lors de la modification de l\'admin';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.editedAdmin = {
      nom: '',
      prenom: '',
      username: '',
      numTel: '',
      avatar: ''
    };
    this.selectedFile = null;
    this.previewUrl = '/images/user/default.png';
    this.errorMessage = '';
  }

}
