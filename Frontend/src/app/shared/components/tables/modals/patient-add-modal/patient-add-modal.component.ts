import { AuthService ,AuthAdmin} from './../../../../../../services/auth.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { PatientService,Patient } from '../../../../../../services/patient.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-add-modal',
  imports: [ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './patient-add-modal.component.html',
})
export class PatientAddModalComponent {
 @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();
  
  patient: Patient = {
  cin: '',
  nom: '',
  prenom: '',
  dateNaissance: new Date(),
  sexe: '',
  numTel: '',
  email: '',
  adresse:'',
  mutuelleNom: '',
  mutuelleNumero: '',
  mutuelleExpireLe: new Date(),
  actif: true,
   cabinetId: 0,
  };
  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  constructor(private patientService: PatientService,
    private authService: AuthService
  ) {}

 user:AuthAdmin ={
  nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
    avatar: '',
  actif: true,
  cabinetId: 0,
}
  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }
   ngOnInit(): void {
    this.loadCurrentUser();
  }



   loadCurrentUser(): void {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('❌ Erreur chargement user dropdown:', err);
      }
    });
  }
  handleSave() {
  // Validation
  if (!this.patient.nom || !this.patient.prenom || !this.patient.dateNaissance  || !this.patient.numTel ||
      !this.patient.sexe 
  ) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Créer le patient
  this.patient.cabinetId=this.user.cabinetId;
  this.patientService.create(this.patient).subscribe({
    next: (createPatient) => {
      console.log('Patient créé:', createPatient);
      // fermer le modal après création
      this.closeAddModal();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur création patient:', error);
      this.errorMessage = 'Erreur lors de la création du patient';
      this.isLoading = false;
    }
  });
}

  resetForm() {
    this.patient = {
       cin: '',
        nom: '',
        prenom: '',
        dateNaissance: new Date(),
        sexe: '',
        numTel: '',
        email: '',
        adresse:'',
        mutuelleNom: '',
        mutuelleNumero: '',
        mutuelleExpireLe: new Date(),
      
    };
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
