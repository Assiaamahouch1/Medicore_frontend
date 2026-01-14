import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateOrdonnanceRequest, CreateLigneOrdonnanceRequest } from '../../../../../services/consultation.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { MedicamentService, Medicament } from '../../../../../services/medicament.service';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './ordonnance-form.component.html'
})
export class OrdonnanceFormComponent implements OnInit {
  @Input() ordonnance: CreateOrdonnanceRequest = {
    consultationId: '',
    type: '',
    lignes: []
  };
  @Input() show = false;
  @Output() save = new EventEmitter<CreateOrdonnanceRequest>();
  @Output() cancel = new EventEmitter<void>();

  newLigne: CreateLigneOrdonnanceRequest = {
    nom: '',
    dosage: '',
    duree: '',
    forme:'',
    medicamentId: undefined
  };

  // Autocomplétion
  medicamentSuggestions: Medicament[] = [];
  showSuggestions = false;
  searchSubject = new Subject<string>();
  selectedMedicament: Medicament | null = null;

  constructor(private medicamentService: MedicamentService) {}

  ngOnInit() {
    // Écouter les changements de recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.length >= 2) {
          return this.medicamentService.suggest(query, 10).pipe(
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    ).subscribe(medicaments => {
      this.medicamentSuggestions = medicaments || [];
      this.showSuggestions = this.medicamentSuggestions.length > 0 && (this.newLigne.nom?.length ?? 0) >= 2;
    });
  }

  onNomInput() {
    const query = this.newLigne.nom || '';
    this.searchSubject.next(query);
  }

  selectMedicament(medicament: Medicament) {
    this.selectedMedicament = medicament;
    this.newLigne.nom = medicament.nom;
    
    this.newLigne.medicamentId = medicament.id;
    
    // Pré-remplir le dosage si disponible
    if (medicament.dosageUnite && !this.newLigne.dosage) {
      this.newLigne.dosage = medicament.dosageUnite;
    }
    if (medicament.forme && !this.newLigne.forme) {
      this.newLigne.forme = medicament.forme;
    }
    
    this.showSuggestions = false;
  }

  onInputFocus() {
    if (this.newLigne.nom && this.newLigne.nom.length >= 2) {
      this.onNomInput();
    }
  }

  onInputBlur() {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  addLigne() {
    if (this.newLigne.nom || this.newLigne.dosage) {
      this.ordonnance.lignes = this.ordonnance.lignes || [];
      this.ordonnance.lignes.push({ ...this.newLigne });
      this.newLigne = {
        nom: '',
        dosage: '',
        duree: '',
        forme: '',
        medicamentId: undefined
      };
      this.selectedMedicament = null;
      this.showSuggestions = false;
    }
  }

  removeLigne(index: number) {
    if (this.ordonnance.lignes) {
      this.ordonnance.lignes.splice(index, 1);
    }
  }

  onSave() {
    this.save.emit(this.ordonnance);
    window.location.reload();
  }

  onCancel() {
    this.cancel.emit();
  }
}