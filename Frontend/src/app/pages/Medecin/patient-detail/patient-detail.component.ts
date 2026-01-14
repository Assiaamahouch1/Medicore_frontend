import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService, Patient } from '../../../../services/patient.service';
import { RendezvousService, RendezVous } from '../../../../services/rendezvous.service';
import { ConsultationService, Consultation, DocumentMedical, Ordonnance, CreateOrdonnanceRequest } from '../../../../services/consultation.service';
import { AuthService, AuthAdmin } from '../../../../services/auth.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { PatientListComponent } from '../../../shared/components/espace-patient/patient-list/patient-list.component';
import { PatientInfoComponent } from '../../../shared/components/espace-patient/patient-info/patient-info.component';
import { ConsultationListComponent } from '../../../shared/components/espace-patient/consultation-list/consultation-list.component';
import { ConsultationFormComponent } from '../../../shared/components/espace-patient/consultation-form/consultation-form.component';
import { OrdonnanceFormComponent } from '../../../shared/components/espace-patient/ordonnance-form/ordonnance-form.component';
import { MedicalRecordComponent } from '../../../shared/components/espace-patient/medical-record/medical-record.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    PatientListComponent,
    PatientInfoComponent,
    ConsultationListComponent,
    ConsultationFormComponent,
    OrdonnanceFormComponent,
    MedicalRecordComponent
  ],
  templateUrl: './patient-detail.component.html',
})
export class PatientDetailComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  patientId: string | null = null;
  currentUser: AuthAdmin | null = null;
  
  // Onglets
  activeTab: 'liste' | 'dossier' = 'liste';
  
  // Données du dossier
  consultations: Consultation[] = [];
  ordonnances: Ordonnance[] = [];
  documentMedical: DocumentMedical | null = null;
  loadingConsultations = false;
  loadingDocument = false;
  
  // Formulaires
  showConsultationForm = false;
  showOrdonnanceForm = false;
  selectedConsultationId: string = '';
  
  newConsultation: Consultation = {
    type: '',
    dateConsultation: new Date(),
    examenClinique: '',
    examenComplementaire: '',
    diagnostic: '',
    traitement: '',
    observations: '',
    patientId: ''
  };
  
  newOrdonnance: CreateOrdonnanceRequest = {
    consultationId: '',
    type: '',
    lignes: []
  };
  
  // Patients arrivés
  patientsArrives: RendezVous[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private rendezvousService: RendezvousService,
    private consultationService: ConsultationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentAuth().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser?.cabinetId) {
          this.loadPatients();
          this.loadPatientsArrives();
        }
      },
      error: (err) => console.error('Erreur chargement utilisateur:', err)
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        const newPatientId = params['id'];
        // Ne recharger que si c'est un nouveau patient
        if (this.patientId !== newPatientId) {
          this.patientId = newPatientId;
          this.activeTab = 'dossier';
          this.loadPatientDetails(newPatientId);
        }
      }
    });
  }

  loadPatients() {
    if (!this.currentUser?.cabinetId) return;
    
    this.patientService.getAll(this.currentUser.cabinetId).subscribe({
      next: (patients) => {
        this.patients = patients;
        // Si on a déjà un patientId (depuis la route), charger ses données
        if (this.patientId && !this.selectedPatient) {
          this.selectedPatient = patients.find(p => p.id === this.patientId!) || null;
          if (this.selectedPatient) {
            console.log('Patient trouvé dans la liste, chargement des données');
            this.loadAllPatientData(this.selectedPatient.id!);
          } else {
            // Si le patient n'est pas dans la liste, le charger directement
            this.loadPatientDetails(this.patientId);
          }
        }
      },
      error: (err) => console.error('Erreur chargement patients:', err)
    });
  }

  loadPatientsArrives() {
    if (!this.currentUser?.cabinetId) return;
    
    this.rendezvousService.getRendezVousArrive(this.currentUser.cabinetId).subscribe({
      next: (rdvs) => {
        this.patientsArrives = rdvs;
      },
      error: (err) => console.error('Erreur chargement patients arrivés:', err)
    });
  }

  loadPatientDetails(patientId: string) {
    if (!patientId) {
      console.error('PatientId est vide pour charger les détails');
      return;
    }
    
    console.log('Chargement des détails du patient:', patientId);
    
    this.patientService.getById(patientId).subscribe({
      next: (patient) => {
        console.log('Patient chargé:', patient);
        this.selectedPatient = patient;
        this.loadAllPatientData(patientId);
      },
      error: (err) => {
        console.error('Erreur chargement patient:', err);
        // Essayer de charger les données même si le patient n'est pas trouvé dans la liste
        // (peut-être qu'il est déjà dans la liste)
        const existingPatient = this.patients.find(p => p.id === patientId);
        if (existingPatient) {
          this.selectedPatient = existingPatient;
          this.loadAllPatientData(patientId);
        }
      }
    });
  }

  loadAllPatientData(patientId: string) {
    if (!patientId) {
      console.error('PatientId est vide, impossible de charger les données');
      this.consultations = [];
      this.ordonnances = [];
      return;
    }
    
    console.log('=== CHARGEMENT DES DONNÉES DU PATIENT ===');
    console.log('Patient ID:', patientId);
    
    // Réinitialiser les données
    this.consultations = [];
    this.ordonnances = [];
    this.loadingConsultations = true;
    
    // Charger toutes les données
    this.loadConsultations(patientId);
    this.loadDocumentMedical(patientId);
  }

  loadConsultations(patientId: string) {
    if (!patientId) {
      console.error('PatientId est vide pour charger les consultations');
      this.consultations = [];
      this.loadingConsultations = false;
      return;
    }
    
    console.log('Chargement des consultations pour le patient:', patientId);
    this.loadingConsultations = true;
    this.consultations = []; // Réinitialiser avant de charger
    
    this.consultationService.getConsByPatient(patientId).subscribe({
      next: (consultations) => {
        console.log('Consultations reçues du serveur:', consultations);
        console.log('Nombre de consultations:', consultations?.length || 0);
        
        // S'assurer que consultations est un tableau
        this.consultations = Array.isArray(consultations) ? consultations : [];
        this.loadingConsultations = false;
        
        console.log('Consultations assignées:', this.consultations.length);
        
        // Charger les ordonnances pour chaque consultation
        if (this.consultations.length > 0) {
          this.consultations.forEach(cons => {
            if (cons.id) {
              this.loadOrdonnances(cons.id);
            }
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement consultations:', err);
        console.error('Détails de l\'erreur:', err.error || err.message);
        this.consultations = [];
        this.loadingConsultations = false;
      }
    });
  }

  loadOrdonnances(consultationId: string) {
    this.consultationService.getOrdonnancesByConsultation(consultationId).subscribe({
      next: (ordonnances) => {
        // Charger les lignes pour chaque ordonnance
        const ordonnancesWithLignes = ordonnances.map(ord => {
          if (ord.id) {
            this.consultationService.getLignesOrdonnance(ord.id).subscribe({
              next: (lignes) => {
                ord.lignes = lignes;
              }
            });
          }
          return ord;
        });
        // Ajouter les nouvelles ordonnances sans dupliquer
        ordonnancesWithLignes.forEach(newOrd => {
          if (!this.ordonnances.find(existing => existing.id === newOrd.id)) {
            this.ordonnances.push(newOrd);
          }
        });
      },
      error: (err) => console.error('Erreur chargement ordonnances:', err)
    });
  }

  loadDocumentMedical(patientId: string) {
    if (!patientId) {
      console.error('PatientId est vide pour charger le dossier médical');
      return;
    }
    
    this.loadingDocument = true;
    this.consultationService.getByPatientDoc(patientId).subscribe({
      next: (doc) => {
        console.log('Dossier médical chargé:', doc ? 'Oui' : 'Non');
        this.documentMedical = doc;
        this.loadingDocument = false;
      },
      error: (err) => {
        console.error('Erreur chargement dossier médical:', err);
        this.documentMedical = null;
        this.loadingDocument = false;
      }
    });
  }

  selectPatient(patient: Patient) {
    if (!patient || !patient.id) {
      console.error('Patient invalide sélectionné');
      return;
    }
    
    console.log('=== SÉLECTION DU PATIENT ===');
    console.log('Patient ID:', patient.id);
    console.log('Patient:', patient.nom, patient.prenom);
    
    this.selectedPatient = patient;
    this.patientId = patient.id;
    this.activeTab = 'dossier';
    
    // Réinitialiser les formulaires
    this.showConsultationForm = false;
    this.showOrdonnanceForm = false;
    
    // Charger les données immédiatement et de manière synchrone
    this.loadAllPatientData(patient.id);
    
    // Naviguer vers la route
    this.router.navigate(['/espacepatients', patient.id]).catch(err => {
      console.error('Erreur navigation:', err);
    });
  }

  openConsultationForm() {
    if (this.selectedPatient?.id) {
      this.newConsultation = {
        type: '',
        dateConsultation: new Date(),
        examenClinique: '',
        examenComplementaire: '',
        diagnostic: '',
        traitement: '',
        observations: '',
        patientId: this.selectedPatient.id
      };
      this.showConsultationForm = true;
    }
  }

  saveConsultation(consultation: Consultation) {
    if (!this.selectedPatient?.id) {
      console.error('Aucun patient sélectionné');
      return;
    }
    
    console.log('Sauvegarde de la consultation pour le patient:', this.selectedPatient.id);
    
    this.consultationService.createCons(consultation).subscribe({
      next: (savedConsultation) => {
        console.log('Consultation sauvegardée:', savedConsultation.id);
        this.showConsultationForm = false;
        // Recharger toutes les consultations pour avoir les données à jour
        this.loadConsultations(this.selectedPatient!.id!);
      },
      error: (err) => {
        console.error('Erreur création consultation:', err);
        alert('Erreur lors de la création de la consultation');
      }
    });
  }

  cancelConsultationForm() {
    this.showConsultationForm = false;
  }

  openOrdonnanceForm(consultationId: string) {
    this.selectedConsultationId = consultationId;
    this.newOrdonnance = {
      consultationId: consultationId,
      type: '',
      lignes: []
    };
    this.showOrdonnanceForm = true;
  }

  saveOrdonnance(ordonnance: CreateOrdonnanceRequest) {
    this.consultationService.createOrdonnance(ordonnance).subscribe({
      next: (savedOrdonnance) => {
        this.ordonnances.push(savedOrdonnance);
        this.showOrdonnanceForm = false;
        if (this.selectedPatient?.id) {
          // Recharger pour avoir les données à jour
          this.loadConsultations(this.selectedPatient.id);
        }
      },
      error: (err) => {
        console.error('Erreur création ordonnance:', err);
        alert('Erreur lors de la création de l\'ordonnance');
      }
    });
  }

  cancelOrdonnanceForm() {
    this.showOrdonnanceForm = false;
  }

  saveDocument(doc: DocumentMedical) {
    if (doc.id) {
      // Mise à jour
      this.consultationService.updateDoc(doc).subscribe({
        next: (updatedDoc) => {
          this.documentMedical = updatedDoc;
        },
        error: (err) => {
          console.error('Erreur mise à jour dossier:', err);
          alert('Erreur lors de la mise à jour du dossier médical');
        }
      });
    } else {
      // Création
      this.consultationService.createDoc(doc).subscribe({
        next: (createdDoc) => {
          this.documentMedical = createdDoc;
        },
        error: (err) => {
          console.error('Erreur création dossier:', err);
          alert('Erreur lors de la création du dossier médical');
        }
      });
    }
  }
  closeDossier() {
    if (!this.selectedPatient?.id) {
      return;
    }

    // Trouver le rendez-vous du patient actuel
    const currentRdv = this.patientsArrives.find(rdv => rdv.patientId === this.selectedPatient?.id);
    
    if (currentRdv && currentRdv.idRdv) {
      // Trouver le prochain patient AVANT de terminer le rendez-vous
      const currentIndex = this.patientsArrives.findIndex(rdv => rdv.patientId === this.selectedPatient?.id);
      const nextRdv = currentIndex >= 0 && currentIndex < this.patientsArrives.length - 1 
        ? this.patientsArrives[currentIndex + 1] 
        : null;
      
      // Terminer le rendez-vous (changer le statut de "arrivé" à "terminé")
      this.rendezvousService.terminerRendezVous(currentRdv.idRdv).subscribe({
        next: () => {
          console.log('Rendez-vous terminé avec succès');
          
          // Recharger la liste des patients arrivés pour mettre à jour les notifications
          this.loadPatientsArrives();
          
          if (nextRdv && nextRdv.patientId) {
            // Passer au patient suivant
            const nextPatient = this.patients.find(p => p.id === nextRdv.patientId);
            if (nextPatient) {
              // Attendre un peu pour que la liste soit mise à jour
              setTimeout(() => {
                this.selectPatient(nextPatient);
              }, 300);
            } else {
              // Si le patient suivant n'est pas dans la liste, le charger
              this.patientService.getById(nextRdv.patientId).subscribe({
                next: (patient) => {
                  setTimeout(() => {
                    this.selectPatient(patient);
                  }, 300);
                },
                error: () => {
                  // Retourner à la liste si le patient n'est pas trouvé
                  this.activeTab = 'liste';
                  this.selectedPatient = null;
                  this.router.navigate(['/espacepatients']).catch(err => {
                    console.error('Erreur navigation:', err);
                  });
                }
              });
            }
          } else {
            // Pas de patient suivant, retourner à la liste
            this.activeTab = 'liste';
            this.selectedPatient = null;
            this.router.navigate(['/espacepatients']).catch(err => {
              console.error('Erreur navigation:', err);
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors de la fermeture du dossier:', err);
          alert('Erreur lors de la fermeture du dossier');
        }
      });
    } else {
      // Pas de rendez-vous trouvé, simplement retourner à la liste
      this.activeTab = 'liste';
      this.selectedPatient = null;
      this.router.navigate(['/espacepatients']).catch(err => {
        console.error('Erreur navigation:', err);
      });
    }
  }
}
