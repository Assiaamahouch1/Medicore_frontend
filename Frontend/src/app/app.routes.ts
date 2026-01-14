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

import { AppLayoutSecrComponent } from './shared/layout/app-layout-secr/app-layout-secr.component';
import { PatientComponent } from './pages/secretaire/patient/patient.component';
import { RendezVousComponent } from './pages/secretaire/rendez-vous/rendez-vous.component';
import { HistoriqueComponent } from './pages/secretaire/historique/historique.component';
import { FacturationComponent } from './pages/secretaire/facturation/facturation.component';
import { AppLayoutAdminComponent } from './shared/layout/app-layout-admin/app-layout-admin.component';
import { ListeAttenteComponent } from './pages/secretaire/liste-attente/liste-attente.component';
import { PatientDetailComponent } from './pages/Medecin/patient-detail/patient-detail.component';
import { HomeComponent } from './pages/home/home.component';


export const routes: Routes = [
  // ========== PAGE D'ACCUEIL PUBLIQUE ==========
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
        title: 'Dashboard Admin | MediCore'
      },
       {
        path: 'profileadmin',
        component: ProfileAdminComponent,
        canActivate: [AuthGuard],
        title: 'Profile Admin | MediCore'
      },
      {
        path: 'admins',
        component: BasicTablesComponent,
        canActivate: [AuthGuard],
        title: 'Gestion Admins | MediCore'
      },
      {
        path: 'admin/cabinets',
        loadChildren: () =>
          import('./pages/admin/cabinets/cabinets.module').then((m) => m.CabinetsModule),
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
        path: 'espacepatients',
        component: PatientDetailComponent,
        canActivate: [AuthGuard],
        title: 'Angular Dashboard | TailAdmin'
      },
   
    ]
    
  },
 
  // ========== ROUTES PUBLIQUES ==========
  { path: 'signin', component: SignInComponent, title: 'Sign In | MediCore' },
  { path: 'forgot-password', component: ForgotComponent, title: 'Mot de passe oublié | MediCore' },
  { path: 'reset-password/:token', component: ResetComponent, title: 'Réinitialisation | MediCore' },

  // Redirection vers la page d'accueil par défaut
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  { path: '**', component: NotFoundComponent, title: '404 Not Found' },
  
];