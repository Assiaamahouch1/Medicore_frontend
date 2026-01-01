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
  patientId?: number;
  userId?: number;
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
  getAll(): Observable<RendezVous[]> {
      return this.http.get<RendezVous[]>(`${this.apiUrl}/all`);
    }

   updatePartiel(id: number, data: {
  dateRdv?: string;
  heureRdv?: string;
  motif?: string;
  notes?: string | null;
}): Observable<RendezVous> {
  return this.http.patch<RendezVous>(`${this.apiUrl}/${id}/modifier-partiel`, data);
}
}
