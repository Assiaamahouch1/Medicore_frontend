import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Facturation } from './../../../../../../services/facturation.service';
import { Patient } from './../../../../../../services/patient.service';
import { RendezVous } from './../../../../../../services/rendezvous.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-facturation-print-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './facturation-print-modal.component.html',
})
export class FacturationPrintModalComponent {
  @Input() facturation!: Facturation;
  @Input() patients: Patient[] = [];
  @Input() rendezvousList: RendezVous[] = [];
  @Output() close = new EventEmitter<void>();

  today = new Date();

  getPatientName(): string {
    // Vérifie si le lien RDV existe (attention au nom exact : rendezVousId avec "s")
    if (!this.facturation.rendezVousId) {
      console.log('Aucun rendezVousId dans la facture');
      return 'Patient non spécifié';
    }

    // Cherche le RDV avec idRdv (nom exact dans l'interface RendezVous)
    const rdv = this.rendezvousList.find(r => r.idRdv === this.facturation.rendezVousId);

    if (!rdv) {
      console.log('RDV non trouvé pour idRdv:', this.facturation.rendezVousId);
      console.log('Liste des idRdv disponibles:', this.rendezvousList.map(r => r.idRdv));
      return 'RDV non trouvé';
    }

    if (!rdv.patientId) {
      console.log('RDV trouvé mais sans patientId');
      return 'Patient non lié au RDV';
    }

    // Cherche le patient
    const patient = this.patients.find(p => p.id === rdv.patientId);

    if (!patient) {
      console.log('Patient non trouvé pour patientId:', rdv.patientId);
      return 'Patient inconnu';
    }

    return `${patient.nom} ${patient.prenom}`.toUpperCase();
  }

  getRdvDateTime(): string {
    if (!this.facturation.rendezVousId) return '';

    const rdv = this.rendezvousList.find(r => r.idRdv === this.facturation.rendezVousId);
    if (!rdv || !rdv.dateRdv || !rdv.heureRdv) return 'Non spécifiée';

    const date = new Date(rdv.dateRdv);
    return `${date.toLocaleDateString('fr-FR')} à ${rdv.heureRdv}`;
  }

  printPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    const primaryColor = [34, 197, 94] as const;
    const textColor = [55, 65, 81] as const;
    const darkText = [17, 24, 39] as const;
    const lightGray = [229, 231, 235] as const;

    // En-tête
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('FACTURE', 105, 35, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Cabinet Médical', 105, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Émise le ${this.today.toLocaleDateString('fr-FR')} à ${this.today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 105, 52, { align: 'center' });

    // Cadre principal
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, 60, 180, 180, 8, 8, 'S');

    let y = 75;

    doc.setFontSize(16);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la facture', 30, y);
    y += 20;

    const addLine = (label: string, value: string, isBoldValue = false) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...textColor);
      doc.text(label, 30, y);

      doc.setFont('helvetica', isBoldValue ? 'bold' : 'normal');
      doc.setFontSize(14);
      doc.setTextColor(...darkText);
      doc.text(value, 90, y);
      y += 18;
    };

    // Numéro de facture (utilise le bon nom de propriété)
    const numFacture = this.facturation.idFacture 
      ? `FAC-${this.facturation.idFacture.toString().padStart(4, '0')}` 
      : 'FAC-N/A';
    addLine('N° Facture', numFacture, true);

    // Patient
    const patientName = this.getPatientName();
    addLine('Patient', patientName, true);

    // Rendez-vous
    if (this.facturation.rendezVousId) {
      addLine('Rendez-vous', this.getRdvDateTime());
    }

    // Date de facturation
    const dateFacture = new Date(this.facturation.date);
    const dateFormatee = dateFacture.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    addLine('Date de facturation', dateFormatee);

    // Mode de paiement
    addLine('Mode de paiement', this.facturation.modePaiement || 'Non spécifié');

    // Montant total
    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Montant total :', 30, y);
    doc.setFontSize(20);
    doc.text(`${this.facturation.montant?.toFixed(2) || '0.00'} DH`, 90, y);

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'italic');
    doc.text('Document officiel • Merci pour votre confiance', 105, 270, { align: 'center' });

    // Nom du fichier
    const safePatientName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Facture_${safePatientName}_${dateFacture.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;

    doc.save(fileName);
  }
}