import { InputFieldComponent } from '../../form/input/input-field.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, InputFieldComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  username: string = '';
  isLoading: boolean = false;
  message: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.authService.forgotPassword(this.username).subscribe({
      next: (res) => {
        this.message = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la demande.';
        this.isLoading = false;
      }
    });
  }
}