import { ProfilesecComponent } from './pages/secretaire/profilesec/profilesec.component';
import { Routes, CanActivate } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { BasicTablesComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { ForgotComponent } from './pages/auth-pages/forgot-password/forgot-password.component';
import { ResetComponent } from './pages/auth-pages/reset-password/reset-password.component';
import { AuthGuard } from './guard/authGuard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AppLayoutSecrComponent } from './shared/layout/app-layout-secr/app-layout-secr.component';
import { PatientComponent } from './pages/secretaire/patient/patient.component';
import { RendezVousComponent } from './pages/secretaire/rendez-vous/rendez-vous.component';

export const routes: Routes = [
 
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        title: 'Angular Profile | TailAdmin'
      },
      {
        path: 'admins',
        component: BasicTablesComponent,
        canActivate: [AuthGuard],
        title: 'Angular Admins | TailAdmin'
      },
    ]
  },


   {
    path: '',
    component: AppLayoutSecrComponent,
    children: [
      { path: '', redirectTo: 'patient', pathMatch: 'full' },
      {
        path: 'patients',
        component: PatientComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
       {
        path: 'profilesec',
        component: ProfilesecComponent,
        canActivate: [AuthGuard],
        title: 'Angular Profile | TailAdmin'
      },
   
    ]
  },
 

  { path: 'signin', component: SignInComponent, title: 'Sign In | TailAdmin' },
  { path: 'forgot-password', component: ForgotComponent },
  { path: 'reset-password/:token', component: ResetComponent },

  { path: '**', component: NotFoundComponent, title: '404 Not Found' },
  
];