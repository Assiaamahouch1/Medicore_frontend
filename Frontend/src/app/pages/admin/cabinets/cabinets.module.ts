import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CabinetsListComponent } from './cabinets-list.component';

const routes: Routes = [
  { path: '', component: CabinetsListComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CabinetsListComponent,
  ],
  declarations: [],
})
export class CabinetsModule {}