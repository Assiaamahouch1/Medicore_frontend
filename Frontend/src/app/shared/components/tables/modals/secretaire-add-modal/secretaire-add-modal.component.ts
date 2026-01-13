import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { SecretaireService, Secretaire } from '../../../../../../services/secretaire.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-secretaire-add-modal',
  imports: [ButtonComponent,
      LabelComponent,ModalComponent,FormsModule,CommonModule], 
  templateUrl: './secretaire-add-modal.component.html',
})
export class SecretaireAddModalComponent {
  @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();
  @Input() cabinetId?: number;


  secretaire: Secretaire = {
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
  constructor(private secretaireService: SecretaireService) {}

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
    if (!this.secretaire.nom || !this.secretaire.prenom || !this.secretaire.username  || !this.secretaire.numTel) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    // Assigner le cabinetId du médecin connecté
    if (this.cabinetId) {
      this.secretaire.cabinetId = this.cabinetId;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. Créer l'secretaire
    this.secretaireService.createSecretaire(this.secretaire).subscribe({
      next: (createdSecretaire) => {
        console.log('Secretaire créé:', createdSecretaire);

        // 2. Upload l'avatar si un fichier est sélectionné
        if (this.selectedFile && createdSecretaire.id) {
          this.secretaireService.uploadImage(createdSecretaire.id, this.selectedFile).subscribe({
            next: (imageUrl) => {
              console.log('Image uploadée:', imageUrl);
              this.isLoading = false;
              this.closeAddModal();
            },
            error: (error) => {
              console.error('Erreur upload image:', error);
              this.isLoading = false;
              // L'secretaire est créé mais sans image
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
        console.error('Erreur création secretaire:', error);
        this.errorMessage = 'Erreur lors de la création de l\'secretaire';
        this.isLoading = false;
      }
    });
  }
  resetForm() {
    this.secretaire = {
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


 
