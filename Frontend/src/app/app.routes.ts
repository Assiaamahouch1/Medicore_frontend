import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { BasicTablesComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    children:[
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'admins',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  // auth pages
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
