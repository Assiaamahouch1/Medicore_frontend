import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultation, Ordonnance } from '../../../../../../services/consultation.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { Patient } from '../../../../../../services/patient.service';
import { AuthService, AuthAdmin } from '../../../../../../services/auth.service';
import { CabinetService, Cabinet } from '../../../../../../services/cabinet.service';


@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './consultation-list.component.html'
})
export class ConsultationListComponent implements OnInit {
  @Input() consultations: Consultation[] = [];
  @Input() ordonnances: Ordonnance[] = [];
  @Input() patient: Patient | null = null;
  @Output() createOrdonnance = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  currentDoctor: AuthAdmin | null = null;
  cabinet: Cabinet | null = null;
  cabinetLogoUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private cabinetService: CabinetService
  ) {}

  ngOnInit() {
    this.loadDoctorAndCabinetInfo();
  }

  loadDoctorAndCabinetInfo() {
    this.authService.getCurrentAuth().subscribe({
      next: (doctor) => {
        this.currentDoctor = doctor;
        if (doctor.cabinetId) {
          this.cabinetService.getCabinetById(doctor.cabinetId).subscribe({
            next: (cabinet) => {
              this.cabinet = cabinet;
              this.loadCabinetLogo(cabinet);
            },
            error: (err) => {
              console.error('Erreur chargement cabinet:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement docteur:', err);
      }
    });
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  loadCabinetLogo(cabinet: Cabinet) {
    if (!cabinet.logo) {
      this.cabinetLogoUrl = '/images/logo/Medicore.png';
      return;
    }

    // Si c'est déjà une URL complète
    if (cabinet.logo.startsWith('http://') || cabinet.logo.startsWith('https://')) {
      this.cabinetLogoUrl = cabinet.logo;
      return;
    }

    // Sinon, charger le logo depuis le service
    this.cabinetService.getLogo(cabinet.logo).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.cabinetLogoUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Erreur chargement logo:', err);
        this.cabinetLogoUrl = null;
      }
    });
  }

  getOrdonnancesForConsultation(consultationId: string | undefined): Ordonnance[] {
    if (!consultationId) return [];
    return this.ordonnances.filter(ord => ord.consultationId === consultationId);
  }

  onCreateOrdonnance(consultationId: string) {
    this.createOrdonnance.emit(consultationId);
  }

  printOrdonnance(ordonnance: Ordonnance) {
    // Si les infos ne sont pas encore chargées, les charger maintenant
    if (!this.currentDoctor || (this.currentDoctor.cabinetId && !this.cabinet)) {
      this.loadDoctorAndCabinetInfo();
      setTimeout(() => this.generatePrintContent(ordonnance), 800);
    } else if (this.cabinet?.logo && !this.cabinetLogoUrl) {
      // Si le logo n'est pas encore chargé, le charger
      this.loadCabinetLogo(this.cabinet);
      // Attendre un peu pour que les données soient chargées
      setTimeout(() => this.generatePrintContent(ordonnance), 500);
    } else {
      this.generatePrintContent(ordonnance);
    }
  }

  generatePrintContent(ordonnance: Ordonnance) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const consultation = this.consultations.find(c => c.id === ordonnance.consultationId);
    const dateOrdonnance = ordonnance.date ? new Date(ordonnance.date) : new Date();
    
    // Informations du docteur
    const doctorName = this.currentDoctor ? `${this.currentDoctor.nom} ${this.currentDoctor.prenom}` : 'N/A';
    const doctorPhone = this.currentDoctor?.numTel || 'N/A';
    
    // Informations du cabinet
    const cabinetName = this.cabinet?.nom || 'N/A';
    const cabinetAddress = this.cabinet?.adresse || 'N/A';
    const cabinetPhone = this.cabinet?.tel || 'N/A';
    const cabinetSpecialite = this.cabinet?.specialite || '';
    
    // Numéro d'ordonnance (basé sur l'ID)
    const ordonnanceNumber = ordonnance.id ? ordonnance.id.substring(0, 8).toUpperCase() : 'N/A';
    
    // Calcul de l'âge du patient
    let patientAge = '';
    if (this.patient?.dateNaissance) {
      const birthDate = new Date(this.patient.dateNaissance);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      patientAge = `${age} ans`;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ordonnance - ${this.patient?.nom || ''} ${this.patient?.prenom || ''}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            padding: 20px;
            max-width: 21cm;
            margin: 0 auto;
            background: white;
          }
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .cabinet-section {
            flex: 1;
            text-align: left;
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .cabinet-logo {
            flex-shrink: 0;
          }
          .cabinet-logo img {
            max-width: 100px;
            max-height: 100px;
            object-fit: contain;
            display: block;
          }
          .cabinet-info-text {
            flex: 1;
          }
          .cabinet-section h1 {
            margin: 0 0 8px 0;
            font-size: 18pt;
            font-weight: bold;
            color: #000;
            text-transform: uppercase;
          }
          .cabinet-section .specialite {
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 5px;
            color: #333;
          }
          .cabinet-section p {
            margin: 3px 0;
            font-size: 10pt;
            line-height: 1.4;
          }
          .doctor-section {
            flex: 1;
            text-align: right;
            padding-left: 20px;
          }
          .doctor-section h2 {
            margin: 0 0 8px 0;
            font-size: 14pt;
            font-weight: bold;
            color: #000;
          }
          .doctor-section p {
            margin: 3px 0;
            font-size: 10pt;
            line-height: 1.4;
          }
          .ordonnance-title {
            text-align: center;
            margin: 25px 0;
            padding: 10px 0;
            border-top: 3px solid #000;
            border-bottom: 3px solid #000;
          }
          .ordonnance-title h1 {
            margin: 0;
            font-size: 20pt;
            font-weight: bold;
            letter-spacing: 2px;
            color: #000;
          }
          .ordonnance-number {
            text-align: right;
            margin-bottom: 15px;
            font-size: 10pt;
            font-weight: bold;
          }
          .date-section {
            text-align: right;
            margin-bottom: 20px;
            font-size: 11pt;
          }
          .patient-section {
            border: 2px solid #000;
            padding: 12px;
            margin-bottom: 25px;
            background-color: #fafafa;
          }
          .patient-section h3 {
            margin: 0 0 10px 0;
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            color: #000;
          }
          .patient-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11pt;
          }
          .patient-details p {
            margin: 4px 0;
          }
          .patient-details strong {
            font-weight: bold;
          }
          .prescriptions-section {
            margin: 30px 0;
          }
          .prescriptions-section h3 {
            margin: 0 0 15px 0;
            font-size: 13pt;
            font-weight: bold;
            text-decoration: underline;
            color: #000;
          }
          .prescription-item {
            margin-bottom: 20px;
            padding: 12px;
            border-left: 4px solid #000;
            background-color: #f9f9f9;
            page-break-inside: avoid;
          }
          .prescription-number {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 5px;
            color: #000;
          }
          .prescription-description {
            font-size: 11pt;
            margin: 5px 0;
            font-weight: bold;
          }
          .prescription-details {
            margin-top: 8px;
            padding-left: 15px;
            font-size: 10pt;
          }
          .prescription-details p {
            margin: 4px 0;
          }
          .prescription-details strong {
            font-weight: bold;
          }
          .empty-prescriptions {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #666;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-left {
            flex: 1;
          }
          .signature-right {
            flex: 1;
            text-align: right;
          }
          .signature-box {
            border: 2px solid #000;
            width: 250px;
            height: 80px;
            margin: 0 auto;
            position: relative;
            background: white;
          }
          .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin: 50px auto 5px auto;
          }
          .signature-text {
            text-align: center;
            font-size: 10pt;
            margin-top: 5px;
            font-weight: bold;
          }
          .cachet-space {
            border: 2px dashed #666;
            width: 200px;
            height: 60px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            color: #999;
            font-style: italic;
          }
          .footer-note {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            color: #666;
            text-align: center;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <!-- En-tête avec Cabinet et Docteur -->
        <div class="header-section">
  
          <div class="cabinet-section">
            <div class="cabinet-info-text">
              <h1>${cabinetName}</h1>
              ${cabinetSpecialite ? `<div class="specialite">${cabinetSpecialite}</div>` : ''}
              <p>${cabinetAddress}</p>
              <p><strong>Tél:</strong> ${cabinetPhone}</p>
            </div>
          </div>

          ${this.cabinetLogoUrl ? `
            <div class="cabinet-logo">
              <img src="${this.cabinetLogoUrl}" alt="Logo ${cabinetName}" />
            </div>
          ` : ''}

          <div class="doctor-section">
            <h2>Dr. ${doctorName}</h2>
            <p><strong>Tél:</strong> ${doctorPhone}</p>
            ${cabinetSpecialite ? `<p><strong>Spécialité:</strong> ${cabinetSpecialite}</p>` : ''}
          </div>

        </div>

                
        <!-- Titre ORDONNANCE -->
        <div class="ordonnance-title">
          <h1>ORDONNANCE MÉDICALE</h1>
        </div>
        
        <!-- Numéro et Date -->
        <div class="ordonnance-number">
          <strong>N°:</strong> ${ordonnanceNumber}
        </div>
        <div class="date-section">
          <strong>Date:</strong> ${dateOrdonnance.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        <!-- Informations Patient -->
        <div class="patient-section">
          <h3>PATIENT(E)</h3>
          <div class="patient-details">
            <p><strong>Nom et Prénom:</strong> ${this.patient?.nom || 'N/A'} ${this.patient?.prenom || ''}</p>
          </div>
        </div>
        
        <!-- Prescriptions -->
        <div class="prescriptions-section">
          <h3>PRESCRIPTIONS MÉDICALES</h3>
          ${ordonnance.lignes && ordonnance.lignes.length > 0 
            ? ordonnance.lignes.map((ligne, index) => `
              <div class="prescription-item">
                <div class="prescription-number">${index + 1}.</div>
                <div class="prescription-description">${ligne.description || 'Prescription'}</div>
                <div class="prescription-details">
                  ${ligne.dosage ? `<p><strong>Dosage:</strong> ${ligne.dosage}</p>` : ''}
                  ${ligne.duree ? `<p><strong>Durée du traitement:</strong> ${ligne.duree}</p>` : ''}
                </div>
              </div>
            `).join('')
            : '<div class="empty-prescriptions">Aucune prescription enregistrée</div>'
          }
        </div>
        
        <!-- Signature et Cachet -->
        <div class="signature-section">
          
          <div class="signature-right">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-text">Dr. ${doctorName}</div>
            </div>
          </div>
        </div>
        
        <!-- Note de bas de page -->
        <div class="footer-note">
          Cette ordonnance est valable pour une durée de 3 mois à compter de la date d'émission.
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

