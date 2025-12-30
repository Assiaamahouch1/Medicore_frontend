import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CabinetService } from '../../../../../../services/cabinet.service';
import { Cabinet } from '../../../../../models/cabinet.model';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabinet-add-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, FormsModule, CommonModule], 
  templateUrl: './cabinet-add-modal.component.html',
})
export class CabinetAddModalComponent {
  @Input() isAddModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();

  cabinet: Cabinet = {
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

  closeAddModal() {
    this.resetForm();
    this.close.emit();
  }

  handleSave() {
    if (!this.cabinet.nom) {
      this.errorMessage = 'Le nom du cabinet est obligatoire';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cabinetService.createCabinet(this.cabinet).subscribe({
      next: (createdCabinet) => {
        console.log('Cabinet créé:', createdCabinet);

        if (this.selectedFile && createdCabinet.id) {
          this.cabinetService.uploadLogo(createdCabinet.id, this.selectedFile).subscribe({
            next: (logoUrl) => {
              console.log('Logo uploadé:', logoUrl);
              this.isLoading = false;
              this.closeAddModal();
            },
            error: (error) => {
              console.error('Erreur upload logo:', error);
              this.isLoading = false;
              this.closeAddModal();
            }
          });
        } else {
          this.isLoading = false;
          this.closeAddModal();
        }
      },
      error: (error) => {
        console.error('Erreur création cabinet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du cabinet';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.cabinet = {
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

