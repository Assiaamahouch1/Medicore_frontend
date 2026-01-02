import { Facturation, FacturationService } from './../../../../../../services/facturation.service';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { LabelComponent } from '../../../form/label/label.component';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { CommonModule } from '@angular/common'; // ← AJOUTER CECI

@Component({
  selector: 'app-facturation-show-modal',
  imports: [ButtonComponent,LabelComponent,ModalComponent,CommonModule],
  templateUrl: './facturation-show-modal.component.html',
})
export class FacturationShowModalComponent {
@Input() isShowModalOpen: boolean = false; 
  @Input() facturation:Facturation | null = null;
  @Output() close = new EventEmitter<void>();

constructor(private facturationService: FacturationService) {}
 
  closeShowModal() {
  this.close.emit();
}
ngOnChanges() {
  console.log('Facture reçue :', this.facturation);
}


  handleSave() {
  console.log('Saving...', this.facturation);
  this.close.emit();
}

}
