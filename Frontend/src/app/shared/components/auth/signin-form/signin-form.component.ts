import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
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

  onSignIn() {
    console.log('onSignIn() appelé ! Email:', this.username, 'Password:', this.password);
    this.errorMessage = '';
    this.isLoading = true;

    // Validation simple
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
  next: (token: string) => {  // ← token est directement la string
    console.log('Token reçu :', token);
    sessionStorage.setItem('token', token);
    this.router.navigate(['']);
    this.isLoading = false;
  },
  error: (err) => {
    console.error('Erreur réelle :', err);
    this.errorMessage = err.error?.message || 'Identifiants incorrects.';
    this.isLoading = false;
  }
});
  }
}