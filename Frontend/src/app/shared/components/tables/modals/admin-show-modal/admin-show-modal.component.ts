import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { Admin } from '../../../../../../services/admin.service';
import { CommonModule } from '@angular/common'; // ← AJOUTER CECI


@Component({
  selector: 'app-admin-show-modal',
  standalone: true,
  imports: [ButtonComponent,
      LabelComponent,ModalComponent, CommonModule], 
  templateUrl: './admin-show-modal.component.html',
})
export class AdminShowModalComponent {
  @Input() isShowModalOpen: boolean = false; 
  @Input() admin: Admin | null = null;
  @Output() close = new EventEmitter<void>();


  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.admin) {
          this.admin.avatar = reader.result as string;
        }
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
