import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { Cabinet } from '../../../../../models/cabinet.model';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabinet-edit-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, FormsModule, CommonModule], 
  templateUrl: './cabinet-edit-modal.component.html',
})
export class CabinetEditModalComponent implements OnChanges {
  @Input() isEditModalOpen: boolean = false; 
  @Input() cabinet: Cabinet | null = null;
  @Output() close = new EventEmitter<void>();

  editedCabinet: Cabinet = {
    nom: '',
    specialite: '',
    adresse: '',
    tel: '',
    logo: '',
    date_expiration_service: ''
  };
  
  selectedFile: File | null = null;
  previewUrl: string = '/images/logo/Medicore.png';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private cabinetService: CabinetService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cabinet'] && this.cabinet) {
      this.editedCabinet = { ...this.cabinet };
      if (this.cabinet.logo) {
        this.loadLogo(this.cabinet.logo);
      } else {
        this.previewUrl = '/images/logo/Medicore.png';
      }
    }
  }

  loadLogo(logoFilename: string) {
    this.cabinetService.getLogo(logoFilename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.previewUrl = '/images/logo/Medicore.png';
      }
    });
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  closeEditModal() {
    this.resetForm();
    this.close.emit();
  }

  handleSave() {
    if (!this.editedCabinet.nom) {
      this.errorMessage = 'Le nom du cabinet est obligatoire';
      return;
    }

    if (!this.cabinet?.id) {
      this.errorMessage = 'ID du cabinet introuvable';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.updateCabinet(this.cabinet.id, this.editedCabinet).subscribe({
      next: (updatedCabinet) => {
        console.log('Cabinet mis à jour:', updatedCabinet);

        if (this.selectedFile && updatedCabinet.id) {
          this.cabinetService.uploadLogo(updatedCabinet.id, this.selectedFile).subscribe({
            next: (logoUrl) => {
              console.log('Logo mis à jour:', logoUrl);
              this.isLoading = false;
              this.closeEditModal();
            },
            error: (error) => {
              console.error('Erreur upload logo:', error);
              this.isLoading = false;
              this.closeEditModal();
            }
          });
        } else {
          this.isLoading = false;
          this.closeEditModal();
        }
      },
      error: (error) => {
        console.error('Erreur mise à jour cabinet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du cabinet';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.editedCabinet = {
      nom: '',
      specialite: '',
      adresse: '',
      tel: '',
      logo: '',
      date_expiration_service: ''
    };
    this.selectedFile = null;
    this.previewUrl = '/images/logo/Medicore.png';
    this.errorMessage = '';
  }
}