import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { AuthService, RegisterRequest } from '../../../../../../services/auth.service';
import { Cabinet } from '../../../../../models/cabinet.model';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cabinet-add-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, FormsModule, CommonModule], 
  templateUrl: './cabinet-add-modal.component.html',
})
export class CabinetAddModalComponent {
  @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();

  // Informations du cabinet
  cabinet: Cabinet = {
    nom: '',
    specialite: '',
    adresse: '',
    tel: '',
    logo: '',
    date_expiration_service: ''
  };

  // Informations du médecin
  medecin = {
    nom: '',
    prenom: '',
    username: '', // email
    password: '',
    numTel: '',
    signature: ''
  };
  
  selectedLogoFile: File | null = null;
  previewLogoUrl: string = '/images/logo/Medicore.png';
  
  selectedAvatarFile: File | null = null;
  previewAvatarUrl: string = '/images/user/default.png';
  
  isLoading: boolean = false;
  errorMessage: string = '';
  currentStep: number = 1; // 1 = Cabinet, 2 = Médecin
  
  constructor(
    private cabinetService: CabinetService,
    private authService: AuthService
  ) {}

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewLogoUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    }
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedAvatarFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewAvatarUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedAvatarFile);
    }
  }

  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }

  nextStep() {
    if (!this.cabinet.nom) {
      this.errorMessage = 'Le nom du cabinet est obligatoire';
      return;
    }
    this.errorMessage = '';
    this.currentStep = 2;
  }

  previousStep() {
    this.errorMessage = '';
    this.currentStep = 1;
  }

  validateMedecin(): boolean {
    if (!this.medecin.nom) {
      this.errorMessage = 'Le nom du médecin est obligatoire';
      return false;
    }
    if (!this.medecin.prenom) {
      this.errorMessage = 'Le prénom du médecin est obligatoire';
      return false;
    }
    if (!this.medecin.username) {
      this.errorMessage = 'L\'email du médecin est obligatoire';
      return false;
    }
    if (!this.medecin.password || this.medecin.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }
    return true;
  }

  handleSave() {
    if (!this.validateMedecin()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Étape 1: Créer le cabinet
    this.cabinetService.createCabinet(this.cabinet).subscribe({
      next: (createdCabinet) => {
        console.log('Cabinet créé:', createdCabinet);
        
        // Normaliser l'ID du cabinet (camelCase ou snake_case)
        const cabinetId = (createdCabinet as any).id;
        
        if (!cabinetId) {
          this.errorMessage = 'Erreur: ID du cabinet non reçu';
          this.isLoading = false;
          return;
        }

        // Étape 2: Créer le médecin avec le cabinetId
        const registerRequest: RegisterRequest = {
          username: this.medecin.username,
          password: this.medecin.password,
          nom: this.medecin.nom,
          prenom: this.medecin.prenom,
          numTel: this.medecin.numTel || undefined,
          signature: this.medecin.signature || undefined,
          role: 'MEDECIN',
          cabinetId: cabinetId
        };

        this.authService.register(registerRequest).subscribe({
          next: (response) => {
            console.log('Médecin créé:', response);
            
            // Étape 3: Upload du logo du cabinet si sélectionné
            if (this.selectedLogoFile) {
              this.cabinetService.uploadLogo(cabinetId, this.selectedLogoFile).subscribe({
                next: (logoUrl) => console.log('Logo uploadé:', logoUrl),
                error: (err) => console.error('Erreur upload logo:', err)
              });
            }
            
            this.isLoading = false;
            this.closeAddModal();
          },
          error: (error) => {
            console.error('Erreur création médecin:', error);
            this.errorMessage = 'Cabinet créé mais erreur lors de la création du médecin: ' + 
              (error.error || error.message || 'Erreur inconnue');
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur création cabinet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du cabinet';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.cabinet = {
      nom: '',
      specialite: '',
      adresse: '',
      tel: '',
      logo: '',
      date_expiration_service: ''
    };
    this.medecin = {
      nom: '',
      prenom: '',
      username: '',
      password: '',
      numTel: '',
      signature: ''
    };
    this.selectedLogoFile = null;
    this.selectedAvatarFile = null;
    this.previewLogoUrl = '/images/logo/Medicore.png';
    this.previewAvatarUrl = '/images/user/default.png';
    this.errorMessage = '';
    this.currentStep = 1;
  }

  // Générer un mot de passe aléatoire
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.medecin.password = password;
  }
}