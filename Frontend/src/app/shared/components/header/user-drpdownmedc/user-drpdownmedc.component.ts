// user-dropdown.component.ts
import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';

@Component({
  selector: 'app-user-drpdownmedc',
   imports: [
    CommonModule,
    RouterModule,
    DropdownComponent,
    DropdownItemTwoComponent
  ],
  templateUrl: './user-drpdownmedc.component.html',
})
export class UserDrpdownMedcComponent {
  isOpen = false;
  loading = false;
  defaultAvatar = '/images/user/avatar.jpg';
  avatarDataUrl: string = this.defaultAvatar;

  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role:'',
    avatar: ''
  };

  constructor(private authService: AuthService) {}

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
        console.log('👤 User dropdown:', user);
        this.user = user;
        
        // ✅ Charger l'avatar avec authentification JWT
        if (user.avatar) {
          this.loadAvatarWithAuth(user.avatar);
        } else {
          this.avatarDataUrl = this.defaultAvatar;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement user dropdown:', err);
        this.avatarDataUrl = this.defaultAvatar;
        this.loading = false;
      }
    });
  }

  /**
   * ✅ Charger l'avatar avec le token JWT
   */
  loadAvatarWithAuth(avatarFilename: string): void {
    this.authService.getAvatarBlob(avatarFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatarDataUrl = reader.result as string;
          console.log('✅ Avatar dropdown chargé avec succès');
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('❌ Erreur chargement avatar dropdown:', err);
        this.avatarDataUrl = this.defaultAvatar;
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {
    // ✅ Utiliser authService.logout() qui gère tout
    this.authService.logout();
    this.closeDropdown();
  }
}
