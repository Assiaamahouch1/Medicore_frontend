import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarMonthViewComponent, CalendarView, CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { RendezVous } from '../../../../../../services/rendezvous.service';
import { Patient } from '../../../../../../services/patient.service';

@Component({
  selector: 'app-rendezvous-calendar-modal',
  standalone: true,
  imports: [
    CommonModule,
    CalendarMonthViewComponent
  ],
  // Plus aucun provider ici !
  templateUrl: './rendezvous-calendar-modal.component.html',
  styles: [`
    .rdv-dot { height: 8px; width: 8px; background-color: #22c55e; border-radius: 50%; display: inline-block; margin: 0 2px; }
    .rdv-multiple { background-color: #f59e0b; }
    .rdv-annule { background-color: #ef4444; }
  `]
})
export class RendezvousCalendarModalComponent implements OnChanges {
  @Input() rendezvousList: RendezVous[] = [];
  @Input() patients: Patient[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() selectRdv = new EventEmitter<RendezVous>();

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  locale = 'fr';

  events: CalendarEvent<{ rdv: RendezVous }>[] = [];

  ngOnChanges() {
    this.refreshEvents();
  }

  refreshEvents() {
    this.events = this.rendezvousList.map(rdv => {
      const patient = this.patients.find(p => p.id === rdv.patientId);
      const patientName = patient ? `${patient.nom} ${patient.prenom}`.trim() : 'Patient inconnu';
      const heure = rdv.heureRdv || 'Heure non définie';
      const title = `${patientName} - ${heure}`;

      let color = '#22c55e';
      switch (rdv.statut) {
        case 'ANNULE':     color = '#ef4444'; break;
        case 'EN_ATTENTE': color = '#f59e0b'; break;
        case 'HISTORIQUE': color = '#64748b'; break;
      }

      return {
        start: new Date(rdv.dateRdv!),
        title,
        color: { primary: color, secondary: color + '40' },
        meta: { rdv }
      };
    });
  }

  dayClicked({ day }: { day: CalendarMonthViewDay<{ rdv: RendezVous }> }) {
    if (day.events.length === 0) return;
    const rdv = day.events[0].meta?.rdv;
    if (rdv) this.selectRdv.emit(rdv);
  }

  eventClicked({ event }: { event: CalendarEvent<{ rdv: RendezVous }> }) {
    const rdv = event.meta?.rdv;
    if (rdv) this.selectRdv.emit(rdv);
  }
}