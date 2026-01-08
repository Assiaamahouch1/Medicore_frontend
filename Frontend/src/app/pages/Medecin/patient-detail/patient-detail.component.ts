import { ButtonComponent } from './../../../shared/components/ui/button/button.component';
import { PatientService ,Patient} from './../../../../services/patient.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RendezvousService } from '../../../../services/rendezvous.service';
import { RendezVous } from '../../../../services/rendezvous.service';
import { AuthAdmin , AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent 
    
  ],
  templateUrl: './patient-detail.component.html',

})

export class PatientDetailComponent  {
   
}