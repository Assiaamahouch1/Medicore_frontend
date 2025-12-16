import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { InputFieldComponent } from '../../../form/input/input-field.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';


@Component({
  selector: 'app-admin-show-modal',
  imports: [ButtonComponent,
      InputFieldComponent,
      LabelComponent,ModalComponent], 
  templateUrl: './admin-show-modal.component.html',
})
export class AdminShowModalComponent {
  @Input() isShowModalOpen: boolean = false; 
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
  closeShowModal() {
  this.close.emit();
}


  handleSave() {
  console.log('Saving...', this.user);
  this.close.emit();
}

}
