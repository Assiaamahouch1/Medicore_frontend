import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { ResetPasswordComponent } from '../../../shared/components/auth/resetpassword-form/reset-password.component';

@Component({
  selector: 'app-sign-in',
  imports: [
    AuthPageLayoutComponent,
    ResetPasswordComponent,
  ],
  templateUrl: './reset-password.component.html',
  styles: ``
})
export class ResetComponent {

}
