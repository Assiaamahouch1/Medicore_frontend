import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { Secretaire, SecretaireService } from '../../../../../../services/secretaire.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-secretaire-show-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, CommonModule], 
  templateUrl: './secretaire-show-modal.component.html',
})
export class SecretaireShowModalComponent implements OnChanges {
  @Input() isShowModalOpen: boolean = false; 
  @Input() secretaire: Secretaire | null = null;
  @Output() close = new EventEmitter<void>();

  avatarDataUrl: string = '/images/user/default.png';
  defaultAvatar = '/images/user/default.png';

  constructor(private secretaireService: SecretaireService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secretaire'] && this.secretaire) {
      this.loadAvatar();
    }
  }

  loadAvatar(): void {
    if (!this.secretaire?.avatar) {
      this.avatarDataUrl = this.defaultAvatar;
      return;
    }

    this.secretaireService.getAvatar(this.secretaire.avatar).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.avatarDataUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('❌ Erreur chargement avatar modal:', err);
        this.avatarDataUrl = this.defaultAvatar;
      }
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarDataUrl = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  closeShowModal() {
    this.close.emit();
  }

  handleSave() {
    console.log('Saving...', this.secretaire);
    this.close.emit();
  }
}