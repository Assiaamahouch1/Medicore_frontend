import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { Admin, AdminService } from '../../../../../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-show-modal',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, ModalComponent, CommonModule], 
  templateUrl: './admin-show-modal.component.html',
})
export class AdminShowModalComponent implements OnChanges {
  @Input() isShowModalOpen: boolean = false; 
  @Input() admin: Admin | null = null;
  @Output() close = new EventEmitter<void>();

  avatarDataUrl: string = '/images/user/default.png';
  defaultAvatar = '/images/user/default.png';

  constructor(private adminService: AdminService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['admin'] && this.admin) {
      this.loadAvatar();
    }
  }

  loadAvatar(): void {
    if (!this.admin?.avatar) {
      this.avatarDataUrl = this.defaultAvatar;
      return;
    }

    this.adminService.getAvatar(this.admin.avatar).subscribe({
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
    console.log('Saving...', this.admin);
    this.close.emit();
  }
}