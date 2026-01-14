import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../../services/patient.service';
import { RendezVous } from '../../../../../services/rendezvous.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-list.component.html'
})
export class PatientListComponent {
  @Input() patients: Patient[] = [];
  @Input() patientsArrives: RendezVous[] = [];
  @Output() patientSelected = new EventEmitter<Patient>();

  isPatientArrive(patientId: string | undefined): boolean {
    return this.patientsArrives.some(rdv => rdv.patientId === patientId);
  }

  getPatientRdv(patientId: string | undefined): RendezVous | undefined {
    return this.patientsArrives.find(rdv => rdv.patientId === patientId);
  }

  getPatientName(patientId: string | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return 'Patient inconnu';
    return `${patient.nom} ${patient.prenom}`;
  }

  getPatientById(patientId: string | undefined): Patient | undefined {
    if (!patientId) return undefined;
    return this.patients.find(p => p.id === patientId);
  }

  onPatientClick(patient: Patient) {
    this.patientSelected.emit(patient);
  }
  
}

