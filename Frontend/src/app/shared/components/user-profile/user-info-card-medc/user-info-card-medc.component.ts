// user-info-card.component.ts
import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info-card-medc',
   imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './user-info-card-medc.component.html',

})
export class UserInfoCardMedcComponent {
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
    role:'',
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
    this.authService.getAvatarBlob(avatarFilename).subscribe({
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

 

  
}
