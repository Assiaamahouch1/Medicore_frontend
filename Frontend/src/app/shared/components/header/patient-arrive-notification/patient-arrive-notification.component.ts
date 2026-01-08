
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { RendezvousService, RendezVous } from '../../../../../services/rendezvous.service';
import { PatientService, Patient } from '../../../../../services/patient.service';
import { AuthService, AuthAdmin } from '../../../../../services/auth.service';
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';

interface ArriveAlert {
  rdv: RendezVous;
  patient: Patient | undefined;
}

@Component({
  selector: 'app-patient-arrive-notification',
  templateUrl: './patient-arrive-notification.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemComponent],
  standalone: true
})
export class PatientArriveNotificationComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifying = false;
  alerts: ArriveAlert[] = [];
  patients: Patient[] = [];
  currentUser: AuthAdmin | null = null;

  private refreshSubscription?: Subscription;

  constructor(
    private rendezvousService: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit() {
    this.loadCurrentUserAndData();
    
    // Rafraîchir toutes les 30 secondes (les arrivées sont fréquentes)
    this.refreshSubscription = interval(30 * 1000).subscribe(() => {
      this.loadArrivedPatients();
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

 private loadCurrentUserAndData() {
  this.authService.getCurrentAuth().subscribe({
    next: (user) => {
      this.currentUser = user;

      if (this.currentUser?.cabinetId) {
        this.patientService.getAll(this.currentUser.cabinetId).subscribe({
          next: (patients) => {
            this.patients = patients;
            this.loadArrivedPatients(); // 🔥 APRES patients
          },
          error: (err) => console.error(err)
        });
      }
    },
    error: (err) => console.error('Erreur chargement utilisateur:', err)
  });
}


  private loadPatients() {
    // Supposons que tu aies une méthode pour charger tous les patients du cabinet
    // Ou au moins ceux qui ont des RDV → ici on charge tous (ou optimise plus tard)
    if (this.currentUser?.cabinetId) {
      this.patientService.getAll(this.currentUser.cabinetId).subscribe({
        next: (data) => this.patients = data,
        error: (err) => console.error('Erreur chargement patients:', err)
      });
    }
  }
  trackByRdvId(index: number, alert: ArriveAlert) {
  return alert?.rdv?.idRdv ?? index;
}


  loadArrivedPatients() {
    if (!this.currentUser?.cabinetId) return;

    this.rendezvousService.getRendezVousArrive(this.currentUser.cabinetId).subscribe({
      next: (rdvs) => {
        this.alerts = rdvs
  .filter(rdv => rdv != null)
  .map(rdv => ({
    rdv,
    patient: this.patients.find(p => p.id === rdv.patientId)
  }));

        this.notifying = this.alerts.length > 0;
      },
      error: (err) => {
        console.error('Erreur chargement patients arrivés:', err);
      }
    });
  }

  getPatientName(patientId: string | number | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.nom} ${patient.prenom}` : 'Patient inconnu';
  }

  getPatientPhone(patientId: string | number | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient?.numTel ? patient.numTel : '';
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadArrivedPatients(); // Rafraîchir à l'ouverture
    }
  }
 



  closeDropdown() {
    this.isOpen = false;
  }
}