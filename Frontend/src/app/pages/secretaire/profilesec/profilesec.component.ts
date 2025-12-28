import { UserInfoCardSecComponent } from './../../../shared/components/user-profile/user-info-card-sec/user-info-card-sec.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-profilesec',
   imports: [
    CommonModule,
    UserInfoCardSecComponent,
  ],
  templateUrl: './profilesec.component.html',
})
export class ProfilesecComponent {

}
