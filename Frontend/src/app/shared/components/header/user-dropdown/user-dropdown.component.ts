// user-dropdown.component.ts
import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [
    CommonModule,
    RouterModule,
    DropdownComponent,
    DropdownItemTwoComponent
  ]
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  loading = false;
  defaultAvatar = '/images/user/avatar.jpg';

  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    avatar: this.defaultAvatar
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
        
        this.user = {
          ...user,
          avatar: user.avatar 
            ? this.authService.getAvatar(user.avatar)
            : this.defaultAvatar
        };
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement user dropdown:', err);
        this.user.avatar = this.defaultAvatar;
        this.loading = false;
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
    // Supprimer le token
    localStorage.removeItem('token');
    // Ou sessionStorage si tu l'utilises
    // sessionStorage.removeItem('token');
    
    this.closeDropdown();
    
    // Rediriger vers la page de connexion
    // (le routerLink s'en charge déjà dans le template)
  }
}