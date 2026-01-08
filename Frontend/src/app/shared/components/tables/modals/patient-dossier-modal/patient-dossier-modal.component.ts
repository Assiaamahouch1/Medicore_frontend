import { DocumentMedical ,ConsultationService} from './../../../../../../services/consultation.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService,Patient } from './../../../../../../services/patient.service';
import { OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-dossier-modal',
  standalone: true,
  imports: [ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule],
  templateUrl: './patient-dossier-modal.component.html'
})
export class PatientDossierModalComponent {
  @Input() isDocModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();
   @Input() patient:Patient | null = null;
    @Input() existingDoc: DocumentMedical | null = null;
    doc: DocumentMedical = {
    antMedicaux: '',
    antChirug: '',
    allergies:'',
    traitement: '',
    habitudes: '',
    patientId:'',
    };
    selectedFile: File | null = null;
    isLoading: boolean = false;
    errorMessage: string = '';
    constructor(private consultationservice: ConsultationService
    ) {}
  
  
    closeDocModal() {
      this.close.emit();
    }
     ngOnInit(): void {
     
    }
    ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDocModalOpen'] && this.isDocModalOpen) {
      this.loadFormData();
    }
  }

  private loadFormData() {
    if (this.existingDoc) {
      // Mode modification : charger les données existantes
      this.doc = { ...this.existingDoc };
    } else {
      // Mode création : formulaire vide
      this.doc = {
        antMedicaux: '',
        antChirug: '',
        allergies: '',
        traitement: '',
        habitudes: '',
        patientId: this.patient?.id || '',
      };
    }
    this.errorMessage = '';
    this.isLoading = false;
  }

  
  
   
 handleSave() {
  if (
    !this.doc.allergies?.trim() ||
    !this.doc.antChirug?.trim() ||
    !this.doc.antMedicaux?.trim() ||
    !this.doc.habitudes?.trim() ||
    !this.doc.traitement?.trim()
  ) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Toujours assigner patientId
  this.doc.patientId!= this.patient!.id;

  if (this.existingDoc && this.existingDoc.id) {
    // === MODE MODIFICATION ===
    this.consultationservice.updateDoc(this.doc).subscribe({
      next: () => {
        console.log('Dossier médical mis à jour');
        this.closeDocModal();
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        this.errorMessage = 'Erreur lors de la mise à jour';
        this.isLoading = false;
      }
    });
  } else {
    // === MODE CRÉATION ===
    this.consultationservice.createDoc(this.doc).subscribe({
      next: () => {
        console.log('Dossier médical créé');
        this.closeDocModal();
      },
      error: (err) => {
        console.error('Erreur création:', err);
        this.errorMessage = 'Erreur lors de la création';
        this.isLoading = false;
      }
    });
  }
}
private resetForm() {
    this.doc = {
      antMedicaux: '',
      antChirug: '',
      allergies: '',
      traitement: '',
      habitudes: '',
      patientId: this.patient?.id || '',
    };
    this.errorMessage = '';
  }
  }
  