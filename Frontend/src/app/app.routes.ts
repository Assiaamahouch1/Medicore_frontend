import { ProfilesecComponent } from './pages/secretaire/profilesec/profilesec.component';
import { ProfileAdminComponent } from './pages/admin/profileadmin/profileadmin.component';
import { AppLayoutMedcComponent } from './shared/layout/app-layout-medc/app-layout-medc.component';
import { DashboardMedComponent } from './pages/Medecin/dashboard-med/dashboard-med.component';
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
import { DashboardAdminComponent } from './pages/admin/dashboard/dashboard.component';
import { BasicSecrTablesComponent } from './pages/Medecin/secretaire/secretaire.component';
import { ProfileMedcComponent } from './pages/Medecin/profilemedc/profilemedc.component';

import { AppLayoutSecrComponent } from './shared/layout/app-layout-secr/app-layout-secr.component';
import { PatientComponent } from './pages/secretaire/patient/patient.component';
import { RendezVousComponent } from './pages/secretaire/rendez-vous/rendez-vous.component';
import { HistoriqueComponent } from './pages/secretaire/historique/historique.component';
import { FacturationComponent } from './pages/secretaire/facturation/facturation.component';
import { AppLayoutAdminComponent } from './shared/layout/app-layout-admin/app-layout-admin.component';
import { ListeAttenteComponent } from './pages/secretaire/liste-attente/liste-attente.component';
import { PatientDetailComponent } from './pages/Medecin/patient-detail/patient-detail.component';
import { MedicamentComponent } from './pages/admin/medicament/medicament.component';
import { HomeComponent } from './pages/home/home.component';
import {CabinetTablesComponent} from './pages/cabinets/cabinet.component'
import {CabinetAdminTablesComponent} from './pages/admin/cabinets/cabinet.component'

export const routes: Routes = [
  { 
    path: 'home', 
    component: HomeComponent, 
    title: 'MediCore - Trouvez votre médecin' 
  },
 
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
      {
        path: 'medicaments',
        component: MedicamentComponent,
        canActivate: [AuthGuard],
        title: 'Angular Admins | TailAdmin'
      },
      {
        path: 'cabinets',
        component: CabinetTablesComponent,
        canActivate: [AuthGuard],
        title: 'Angular Admins | TailAdmin'
      },
       // Place la feature Cabinets sous le layout Admin
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
       {
        path: 'historique',
        component: HistoriqueComponent,
        canActivate: [AuthGuard],
        title: 'Angular Historique | TailAdmin'
      },
      {
        path: 'factures',
        component: FacturationComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
      {
        path: 'rendezVous',
        component: RendezVousComponent,
        canActivate: [AuthGuard],
        title: 'AngularRendez_Vous | TailAdmin'
      },
      {
        path: 'liste_attente',
        component: ListeAttenteComponent,
        canActivate: [AuthGuard],
        title: 'AngularRendez_Vous | TailAdmin'
      },
   
    ]
  },


  {
    path: '',
    component: AppLayoutAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboardadmin', pathMatch: 'full' },
      {
        path: 'dashboardadmin',
        component: DashboardAdminComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
       {
        path: 'profileadmin',
        component: ProfileAdminComponent,
        canActivate: [AuthGuard],
        title: 'Angular Profile | TailAdmin'

      },
      {
        path: 'admin/medicaments',
        component: MedicamentComponent,
        canActivate: [AuthGuard],
        title: 'Angular Admins | TailAdmin'
      },
   {
        path: 'admin/cabinets',
        component: CabinetAdminTablesComponent,
        canActivate: [AuthGuard],
        title: 'Angular Admins | TailAdmin'
      },
      
    ]
  },
   {
    path: '',
    component: AppLayoutMedcComponent,
    children: [
      { path: '', redirectTo: 'dashboardmed', pathMatch: 'full' },
      {
        path: 'dashboardmed',
        component: DashboardMedComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
      {
        path: 'secretaires',
        component: BasicSecrTablesComponent,
        canActivate: [AuthGuard],
        title: 'Angular secretaires | Tailsecretaires'
},
{
        path: 'profilemedc',
        component: ProfileMedcComponent,
        canActivate: [AuthGuard],
        title: 'Angular Profile | TailAdmin'
      },
      {
        path: 'espacepatients',
        component: PatientDetailComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
      {
        path: 'espacepatients/:id',
        component: PatientDetailComponent,
        canActivate: [AuthGuard],
        title: 'Dossier Patient | TailAdmin'
      },
   
    ]
    
  },
 
  { path: 'signin', component: SignInComponent, title: 'Sign In | TailAdmin' },
  { path: 'forgot-password', component: ForgotComponent },
  { path: 'reset-password/:token', component: ResetComponent },

  { path: '**', component: NotFoundComponent, title: '404 Not Found' },
  
];