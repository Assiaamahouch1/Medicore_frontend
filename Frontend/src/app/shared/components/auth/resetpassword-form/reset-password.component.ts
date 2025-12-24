
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputFieldComponent,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  message: string = '';
  errorMessage: string = '';
  token: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  onSubmit() {
    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

   this.authService.resetPassword(this.token, this.password, this.confirmPassword)
  .subscribe({
    next: (res) => {
      this.message = res;
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/signin']), 2000);
    },
    error: (err) => {
      this.errorMessage = err.error || 'Erreur lors de la réinitialisation.';
      this.isLoading = false;
    }
  });

  }
}