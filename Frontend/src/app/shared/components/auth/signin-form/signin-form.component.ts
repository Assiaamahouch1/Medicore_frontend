import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthAdmin, AuthService } from '../../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {
  user: AuthAdmin = {
    nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
  };
  
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
    loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = {
          ...user
        }; 
        // après avoir reçu les infos de l'utilisateur
       
      
        sessionStorage.setItem('role', user.role); // 'SUPERADMIN' ou 'ADMIN'

      },
      error: (err) => {
        console.error('Erreur chargement current user:', err);
      }
    });
  }
  onSignIn() {
  this.errorMessage = '';
  this.isLoading = true;

  // Validation simple
  if (!this.username || !this.password) {
    this.errorMessage = 'Veuillez remplir tous les champs.';
    this.isLoading = false;
    return;
  }

  this.authService.login(this.username, this.password).subscribe({
    next: (token: string) => {
      console.log('Token reçu :', token);
      sessionStorage.setItem('token', token);

      // Après avoir reçu le token, récupérer les infos de l'utilisateur
      this.authService.getCurrentAuth().subscribe({
        next: (user) => {
          this.user = { ...user };
          sessionStorage.setItem('role', user.role); // stocke 'SUPERADMIN' ou 'ADMIN'
          console.log('Role de l’utilisateur :', user.role);
          if(user.role=="ADMIN")
         {
           this.router.navigate(['/dashboard']);
         }else if(user.role=="MEDECIN"){
          this.router.navigate(['/patients']);
         }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement utilisateur courant:', err);
          this.errorMessage = 'Impossible de récupérer les informations utilisateur.';
          this.isLoading = false;
        }
      });
    },
    error: (err) => {
      console.error('Erreur login :', err);
      this.errorMessage = err.error?.message || 'Identifiants incorrects.';
      this.isLoading = false;
    }
  });
  }
 

}