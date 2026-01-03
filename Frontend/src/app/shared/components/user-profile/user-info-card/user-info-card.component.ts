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

  avatarDataUrl: string = this.defaultAvatar;

  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
    avatar: ''
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
        this.user = user;
        this.userBackup = { ...this.user };
        
        if (user.avatar) {
          this.loadAvatarWithAuth(user.avatar);
        } else {
          this.avatarDataUrl = this.defaultAvatar;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement:', err);
        this.avatarDataUrl = this.defaultAvatar;
        this.loading = false;
      }
    });
  }

  loadAvatarWithAuth(avatarFilename: string): void {
    this.authService.getAvatarBlobSuperAdmin(avatarFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatarDataUrl = reader.result as string;
          console.log('✅ Avatar chargé avec succès en base64');
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('❌ Erreur chargement avatar:', err);
        this.avatarDataUrl = this.defaultAvatar;
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
        this.avatarDataUrl = reader.result as string;
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
          console.log('📤 Réponse upload:', response);
          this.user.avatar = response; 
          this.updateUserInfo();
        },
        error: (err) => {
          console.error('❌ Erreur upload:', err);
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
        console.log('✅ Profil mis à jour:', updatedUser);
        this.user = updatedUser;
        this.userBackup = { ...this.user };
        
        if (updatedUser.avatar) {
          this.loadAvatarWithAuth(updatedUser.avatar);
        }
        
        this.selectedAvatarFile = null;
        this.loading = false;
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Erreur mise à jour:', err);
        this.loading = false;
      }
    });
  }
}