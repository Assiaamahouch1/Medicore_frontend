import { UserInfoCardMedcComponent } from '../../../shared/components/user-profile/user-info-card-medc/user-info-card-medc.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-profilemedc',
   imports: [
    CommonModule,
    UserInfoCardMedcComponent,
  ],
  templateUrl: './profilemedc.component.html',
})
export class ProfileMedcComponent {

}
