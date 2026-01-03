import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { ForgotPasswordComponent } from '../../../shared/components/auth/forgotpassword-form/forgot-password.component';

@Component({
  selector: 'app-sign-in',
  imports: [
    AuthPageLayoutComponent,
    ForgotPasswordComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styles: ``
})
export class ForgotComponent {

}
