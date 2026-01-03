import { Component } from '@angular/core';
import { CabinetTableComponent } from '../../../shared/components/tables/cabinet-table/cabinet-table.component';

@Component({
  selector: 'app-cabinets-list',
  standalone: true,
  imports: [CabinetTableComponent],
  templateUrl: './cabinets-list.component.html',
})
export class CabinetsListComponent {}