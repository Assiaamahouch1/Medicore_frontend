// user-info-card.component.ts
import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    FormsModule,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit {
  isOpen = false;
  loading = false;
  selectedAvatarFile: File | null = null;
  defaultAvatar = '/images/user/default.png';

  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    avatar: this.defaultAvatar
  };

  userBackup: AuthAdmin = { ...this.user };

  constructor(
    public modal: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  /**
   * Charger l'utilisateur connecté
   */
  loadCurrentUser(): void {
    this.loading = true;
    
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        console.log('👤 User reçu du backend:', user);
        console.log('Avatar brut:', user.avatar);
        
        this.user = {
          ...user,
          // getAvatar gère automatiquement les URLs complètes
          avatar: user.avatar 
            ? this.authService.getAvatar(user.avatar)
            : this.defaultAvatar
        };
        
        console.log('Avatar URL finale:', this.user.avatar);
        
        this.userBackup = { ...this.user };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.user.avatar = this.defaultAvatar;
        this.loading = false;
      }
    });
  }

  openModal() {
    this.userBackup = { ...this.user };
    this.isOpen = true;
  }

  closeModal() {
    this.user = { ...this.userBackup };
    this.selectedAvatarFile = null;
    this.isOpen = false;
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      this.selectedAvatarFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.user.avatar = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleSave(): void {
    console.log('💾 Sauvegarde démarrée');
    
    if (!this.user.id) {
      alert('Erreur: ID utilisateur manquant');
      return;
    }

    this.loading = true;

    if (this.selectedAvatarFile) {
      // Upload avatar
      this.authService.uploadImage(this.user.id, this.selectedAvatarFile).subscribe({
        next: (response) => {
          console.log(' Réponse upload:', response);
          
          // La réponse peut être une URL complète ou un filename
          this.user.avatar = this.authService.getAvatar(response);
          console.log('Nouvel avatar URL:', this.user.avatar);
          
          this.updateUserInfo();
        },
        error: (err) => {
          console.error(' Erreur upload:', err);
          this.loading = false;
        }
      });
    } else {
      this.updateUserInfo();
    }
  }

  private updateUserInfo(): void {
    if (!this.user.id) return;

    const updates: Partial<AuthAdmin> = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      numTel: this.user.numTel,
      username: this.user.username
    };

    this.authService.updateCurrentAuth(this.user.id, updates).subscribe({
      next: (updatedUser) => {
        console.log('Profil mis à jour:', updatedUser);
        console.log('Avatar retourné:', updatedUser.avatar);
        
        // Construire l'URL finale de l'avatar
        this.user = {
          ...updatedUser,
          avatar: updatedUser.avatar 
            ? this.authService.getAvatar(updatedUser.avatar)
            : this.defaultAvatar
        };
        
        console.log('Avatar final appliqué:', this.user.avatar);
        
        this.userBackup = { ...this.user };
        this.selectedAvatarFile = null;
        this.loading = false;
        this.closeModal();
        
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        this.loading = false;
      }
    });
  }
}