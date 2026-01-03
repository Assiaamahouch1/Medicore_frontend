import { Patient } from './../../../../../../services/patient.service';
import { RendezVous } from './../../../../../../services/rendezvous.service';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';




@Component({
  selector: 'app-rendezvous-print-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './rendezvous-print-modal.component.html',
})
export class RendezvousPrintModalComponent {
  @Input() rendezvous!: RendezVous;
  @Input() patients: Patient[] = [];
  @Output() close = new EventEmitter<void>();

  today = new Date();

  getPatientName(patientId: string | number | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.nom} ${patient.prenom}`.toUpperCase() : 'Patient inconnu';
  }

  printPDF() {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Couleurs personnalisées
  const primaryColor = [34, 197, 94] as const;    // vert-500 (pour confirmé)
  const textColor = [55, 65, 81] as const;        // gray-700
  const lightGray = [229, 231, 235] as const;     // gray-200
  const darkText = [17, 24, 39] as const;         // gray-900

  // En-tête stylé
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('FICHE DE RENDEZ-VOUS', 105, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Cabinet Médical • Consultation', 105, 45, { align: 'center' });

  // Date de génération
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le ${this.today.toLocaleDateString('fr-FR')} à ${this.today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 105, 52, { align: 'center' });

  // Cadre principal
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(1.5);
  doc.roundedRect(15, 60, 180, 180, 8, 8, 'S'); // Cadre arrondi

  let y = 75;

  // Titre "Détails du rendez-vous"
  doc.setFontSize(16);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du rendez-vous', 30, y);
  y += 20;

  // Lignes de contenu
  const addLine = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(13);
    doc.setTextColor(...textColor);
    doc.text(label, 30, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkText);
    doc.text(value, 90, y);
    y += 18;
  };

  // Patient
  addLine('Patient', this.getPatientName(this.rendezvous.patientId), true);

  // Date
  const dateRdv = new Date(this.rendezvous.dateRdv!);
  const dateFormatee = dateRdv.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  addLine('Date', dateFormatee);

  // Heure
  addLine('Heure', this.rendezvous.heureRdv!);


  // Statut avec couleur
const statut = (this.rendezvous.statut || 'NON DÉFINI').toUpperCase();

let r = 156, g = 163, b = 175;
switch (this.rendezvous.statut) {
  case 'CONFIRME':   [r, g, b] = [34, 197, 94]; break;
  case 'ANNULE':     [r, g, b] = [239, 68, 68]; break;
  case 'EN_ATTENTE': [r, g, b] = [251, 191, 36]; break;
  case 'HISTORIQUE': [r, g, b] = [100, 116, 139]; break;
}

// Label "Statut :" en gris normal
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(55, 65, 81);
doc.text('Statut :', 30, y);

// Valeur du statut en couleur et gras
doc.setTextColor(r, g, b);
doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.text(statut, 90, y);

y += 25; // Espacement suivant

  // Notes (si présentes)
  if (this.rendezvous.notes && this.rendezvous.notes.trim()) {
    doc.setFontSize(14);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 30, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);

    const notesLines = doc.splitTextToSize(this.rendezvous.notes.trim(), 150);
    doc.text(notesLines, 30, y);
    y += notesLines.length * 8 + 15;
  }

  // Pied de page discret
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'italic');
  doc.text('Document confidentiel • À usage interne uniquement', 105, 270, { align: 'center' });

  // Nom du fichier
  const fileName = `Fiche_RDV_${this.getPatientName(this.rendezvous.patientId).replace(/\s+/g, '_')}_${dateRdv.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;

  doc.save(fileName);
}

}