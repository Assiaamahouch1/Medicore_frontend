import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Consultation, Ordonnance } from '../../../../../../services/consultation.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonComponent],
  templateUrl: './consultation-list.component.html'
})
export class ConsultationListComponent {
  @Input() consultations: Consultation[] = [];
  @Input() ordonnances: Ordonnance[] = [];
  @Output() createOrdonnance = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  getOrdonnancesForConsultation(consultationId: string | undefined): Ordonnance[] {
    if (!consultationId) return [];
    return this.ordonnances.filter(ord => ord.consultationId === consultationId);
  }

  onCreateOrdonnance(consultationId: string) {
    this.createOrdonnance.emit(consultationId);
  }
}

