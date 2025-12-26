// user-info-card.component.ts
import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info-card-sec',
   imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './user-info-card-sec.component.html',

})
export class UserInfoCardSecComponent {
 isOpen = false;
  loading = false;
  selectedAvatarFile: File | null = null;
  defaultAvatar = '/images/user/default.png';

  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role:'',
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

 

  
}
