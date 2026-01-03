import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { AdminService, Admin } from '../../../../../../services/admin.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-delete-modal',
  imports: [ModalComponent, CommonModule], 
  templateUrl: './admin-delete-modal.component.html',
})
export class AdminDeleteModalComponent {
  @Input() isDeleteModalOpen: boolean = false; 
  @Output() close = new EventEmitter<boolean>();
  @Input() admin: Admin | null = null; // 
  

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private adminService: AdminService) {}

 
  closeDeleteModal() {
  this.close.emit();
}

  confirmDelete() {
      if (!this.admin?.id) {
        this.errorMessage = 'ID admin manquant';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.adminService.deleteAdmin(this.admin.id).subscribe({
        next: () => {
          console.log('✅ Admin supprimé:', this.admin?.id);
          this.isLoading = false;
          this.close.emit(true); // ✅ Suppression réussie
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression';
          this.isLoading = false;
        }
      });
    }


}
