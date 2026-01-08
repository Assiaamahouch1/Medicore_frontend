import { PatientService,Patient } from './../../../../../../services/patient.service';
import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService ,AuthAdmin} from './../../../../../../services/auth.service';
@Component({
  selector: 'app-patient-edit-modal',
  imports: [ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule],
  templateUrl: './patient-edit-modal.component.html',
})
export class PatientEditModalComponent {
 @Input() isEditModalOpen: boolean = false; 
  @Input() patient:Patient | null = null;
  @Output() close = new EventEmitter<void>();

  editePatient: Patient = {
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
  cabinetId:0
  };
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

  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private patientService:PatientService,
     private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patient'] && this.patient) {
      // Copie les données de l'admin sélectionné
      this.editePatient = { ...this.patient };
      this.selectedFile = null;
      this.errorMessage = '';
    }
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


  closeEditModal() {
    this.resetForm();
    this.close.emit();
  }

  handleSave() {
  // Validation
  this.editePatient.cabinetId=this.user.cabinetId;
  if (!this.editePatient.nom || !this.editePatient.prenom || !this.editePatient.dateNaissance  || !this.editePatient.numTel ||
      !this.editePatient.sexe ) {
    this.errorMessage = 'Tous les champs sont obligatoires';
    return;
  }

  if (!this.editePatient.id) {
    this.errorMessage = 'ID patient manquant';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Mettre à jour les infos du patient
  this.patientService.update(this.editePatient.id, this.editePatient).subscribe({
    next: (updatedPatient) => {
      console.log('✅ Patient mis à jour:', updatedPatient);
      // fermer le modal après mise à jour
      this.closeEditModal();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('❌ Erreur modification patient:', error);
      this.errorMessage = 'Erreur lors de la modification de patient';
      this.isLoading = false;
    }
  });
}

  resetForm() {
    this.editePatient = {
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
    };
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
