import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { ModalService } from '../../../services/modal.service';
import { PatientService, Patient } from '../../../../../services/patient.service';
import { AuthService ,AuthAdmin} from './../../../../../services/auth.service';
import { RendezVous, RendezvousService } from '../../../../../services/rendezvous.service';
import { RendezvousPrintModalComponent } from '../modals/rendezvous-print-modal/rendezvous-print-modal.component';

@Component({
  selector: 'app-liste-table',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableDropdownComponent,
  ],
  templateUrl: './liste-table.component.html',
})
export class ListeTableComponent {
 patients: Patient[] = [];
  transactionData: RendezVous[] = [];
  filteredData: RendezVous[] = [];
  selectedRendezvous: RendezVous | null = null;
  searchTerm: string = '';
  isPrintModalOpen = false;
  isCalendarModalOpen = false;
user:AuthAdmin ={
  nom: '',
    prenom: '',
    username: '',
    numTel: '',
    role: '',
    avatar: '',
  actif: true,
  cabinetId: 0,
}
  // Pour le sélecteur de date
  dateInput: string = '';           // Valeur de l'input date (YYYY-MM-DD)
  selectedDate: string | null = null; // Date actuellement filtrée

  currentPage = 1;
  itemsPerPage = 6;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isShowModalOpen = false;

  constructor(
    public modal: ModalService,
    private rendezvousservice: RendezvousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    
  }
  loadCurrentUser(): void {
  this.authService.getCurrentAuth().subscribe({
    next: (user) => {
      this.user = user;
      console.log('USER CHARGÉ:', this.user);
      this.loadRendezVous();
    this.loadPatients();
    this.showAll(); // Par défaut : tout afficher

     
    },
    error: (err) => {
      console.error('Erreur chargement user:', err);
    }
  });
}



  loadPatients(): void {
    this.patientService.getAll(1).subscribe({
      next: (data: Patient[]) => this.patients = data,
      error: (err) => console.error('Erreur chargement patients:', err)
    });
  }
  

  loadRendezVous(): void {
     if (!this.user.cabinetId) {
    console.warn('cabinetId non défini → requête annulée');
    return;
  }
  
    this.rendezvousservice.getRendezVousConfirme(this.user.cabinetId).subscribe({
      next: (data: RendezVous[]) => {
        this.transactionData = data;
        this.applyCurrentFilter();
      },
      error: (error) => console.error('Erreur chargement rendez vous:', error)
    });
  }
  // Ajoute cette méthode dans ta classe ListeTableComponent
marquerCommeArrive(rdv: RendezVous) {
  if (!rdv.idRdv) {
    console.error('ID du rendez-vous manquant');
    return;
  }


  this.rendezvousservice.setRendezVousArrive(rdv.idRdv).subscribe({
    next: (rdvMisAJour) => {
      // Mise à jour locale du RDV dans la liste
      const index = this.transactionData.findIndex(item => item.idRdv=== rdv.idRdv);
      if (index !== -1) {
        this.transactionData[index] = rdvMisAJour;
      }

      // Réappliquer les filtres pour rafraîchir l'affichage
      this.applyCurrentFilter();

      // Optionnel : message de succès (tu peux utiliser un toast)
      console.log('Patient marqué comme arrivé');
    },
    error: (err) => {
      console.error('Erreur lors du marquage arrivé :', err);
      alert('Erreur : impossible de marquer le patient comme arrivé');
    }
  });
}

  // Afficher tous les RDV
  showAll() {
    this.selectedDate = null;
    this.dateInput = '';
    this.applyCurrentFilter();
  }
 

  // Sélectionner aujourd'hui
  selectToday() {
    const today = new Date();
    this.dateInput = today.toISOString().split('T')[0];
    this.onDateChange();
  }

  // Quand on change la date dans l'input
  onDateChange() {
    this.selectedDate = this.dateInput || null;
    this.applyCurrentFilter();
  }

  // Applique le filtre de date + recherche
  private applyCurrentFilter() {
    let data = this.transactionData;

    if (this.selectedDate) {
      data = this.transactionData.filter(rdv => {
        if (!rdv.dateRdv) return false;
        const rdvDate = new Date(rdv.dateRdv);
        return rdvDate.toISOString().split('T')[0] === this.selectedDate;
      });
    }

    this.filteredData = [...data];
    this.onSearchChange(); // Applique la recherche par-dessus
    this.currentPage = 1;
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = this.filteredData; // Garde le filtre de date
    } else {
      this.filteredData = this.filteredData.filter(rdv => {
        const patient = this.patients.find(p => p.id === rdv.patientId);
        const fullName = patient ? `${patient.nom} ${patient.prenom}`.toLowerCase() : '';
        const dateStr = rdv.dateRdv ? new Date(rdv.dateRdv).toLocaleDateString() : '';
        return fullName.includes(term) || dateStr.includes(term);
      });
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): RendezVous[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  getPatientName(patientId: string | number | undefined): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.nom} ${patient.prenom}` : 'N/A';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

 
}
