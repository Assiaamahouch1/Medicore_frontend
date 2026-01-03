import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id?: string;
  cin?: string;
  nom: string;
  prenom: string;
  dateNaissance?: Date;
  sexe?: string;
  numTel?: string;
  email?: string;
  adresse?: string;
  mutuelleNom?: string;
  mutuelleNumero?: string;
  mutuelleExpireLe?: Date;
  actif?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private apiUrl = 'http://localhost:8081/patients';

  constructor(private http: HttpClient) {}

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  update(id: string, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
 restore(id: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/restore/${id}`, {});
}


  getById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/all`);
  }
  getAllNoActif(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/allNoActif`);
  }
}
