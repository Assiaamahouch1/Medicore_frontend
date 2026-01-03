import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CabinetsListComponent } from './cabinets-list.component';

const routes: Routes = [
  { path: '', component: CabinetsListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CabinetsRoutingModule {}