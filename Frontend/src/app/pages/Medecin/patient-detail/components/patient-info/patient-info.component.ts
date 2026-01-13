import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../../../services/patient.service';

@Component({
  selector: 'app-patient-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-info.component.html'
})
export class PatientInfoComponent {
  @Input() patient: Patient | null = null;

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
}

