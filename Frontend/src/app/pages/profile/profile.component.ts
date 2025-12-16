import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    UserInfoCardComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {

}
