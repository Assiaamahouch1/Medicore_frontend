import { UserInfoCardAdminComponent } from './../../../shared/components/user-profile/user-info-card-admin/user-info-card-admin.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-profileadmin',
   imports: [
    CommonModule,
    UserInfoCardAdminComponent,
  ],
  templateUrl: './profileadmin.component.html',
})
export class ProfileAdminComponent {

}
