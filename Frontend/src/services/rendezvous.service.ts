import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RendezVous {
  idRdv?: number;
  dateRdv?: string;
  heureRdv?: string;
  motif?: string;
  statut?: string;
  notes?: string;
  patientId?: string;
  userId?: number;
  cabinetId?:number;
}

export interface DashboardStats {
  patientsEnAttenteSalle: number;
  rdvConfirmesAujourdhui: number;
  rdvEnAttenteConfirmation: number;
  consultationsAujourdhui: number;
  totalRdvJour: number;
}

export interface ConsultationStats {
  date: string;
  jour: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class RendezvousService {

  private apiUrl = 'http://localhost:8081/rendezVous';

  constructor(private http: HttpClient) {}

  // ✅ Créer un rendez-vous
  creerRendezVous(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, rdv);
  }

  // ✅ Annuler un rendez-vous
  annulerRendezVous(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/annuler/${id}`, null, {
      responseType: 'text'
    });
  }
 getAll(cabinetId: number): Observable<RendezVous[]> {
     return this.http.get<RendezVous[]>(`${this.apiUrl}/all/${cabinetId}`);
   }

   updatePartiel(id: number, data: {
  dateRdv?: string;
  heureRdv?: string;
  motif?: string;
  notes?: string | null;
  cabinetId?:number;
}): Observable<RendezVous> {
  return this.http.patch<RendezVous>(`${this.apiUrl}/${id}/modifier-partiel`, data);
}


getRendezVousEnAttente(cabinetId: number) {
 return this.http.get<RendezVous[]>(`${this.apiUrl}/en_attente/${cabinetId}`);
}
getRendezVousConfirme(cabinetId: number) {
 return this.http.get<RendezVous[]>(`${this.apiUrl}/liste/${cabinetId}`);
}


 confirmer(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/confirmer/${id}`, null);
}



getRendezVousArrive(cabinetId: number) {
 return this.http.get<RendezVous[]>(`${this.apiUrl}/allArrive/${cabinetId}`);
}


setRendezVousArrive(idRdv: number) {
  return this.http.put<RendezVous>(`${this.apiUrl}/Arrive/${idRdv}`,{});
}

// ============ DASHBOARD STATS METHODS ============

/**
 * Récupère les statistiques pour le dashboard médecin
 */
getDashboardStats(cabinetId: number): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard/${cabinetId}`);
}

/**
 * Récupère les statistiques des consultations sur les 7 derniers jours
 */
getConsultationsWeekStats(cabinetId: number): Observable<ConsultationStats[]> {
  return this.http.get<ConsultationStats[]>(`${this.apiUrl}/stats/consultations-week/${cabinetId}`);
}

/**
 * Récupère la répartition des types de consultations (par motif)
 */
getTypesRepartition(cabinetId: number): Observable<{ [key: string]: number }> {
  return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/stats/types-repartition/${cabinetId}`);
}
}
