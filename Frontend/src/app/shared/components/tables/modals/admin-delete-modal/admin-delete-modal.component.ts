import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { ModalComponent } from '../../../ui/modal/modal.component';


@Component({
  selector: 'app-admin-delete-modal',
  imports: [ButtonComponent, ModalComponent], 
  templateUrl: './admin-delete-modal.component.html',
})
export class AdminDeleteModalComponent {
  @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<void>();

  

  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '/images/user/avatar.jpg',
  };

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.user.avatar = reader.result as string;
      reader.readAsDataURL(input.files[0]);
    }
  }
  closeDeleteModal() {
  this.close.emit();
}


  handleSave() {
  console.log('Saving...', this.user);
  this.close.emit();
}
confirmDelete() {
  console.log('Utilisateur supprimé');
  this.closeDeleteModal();
}


}
