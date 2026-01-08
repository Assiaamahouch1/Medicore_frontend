import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError,of } from 'rxjs';
export interface Consultation {
  id?: string;
  type?: string;
  dateConsultation?: Date;
  examenClinique?: string;
  examenComplementaire?: string;
  diagnostic?: string;
  traitement?: boolean;
  observations?: string; 
  patientId?:string;
}

export interface DocumentMedical {
  id?: string;
  antMedicaux: string;
  antChirug: string;
  allergies: string;
  traitement: string;
  habitudes: string;
  patientId:string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  private apiUrl = 'http://localhost:8081/consultations';
  
  constructor(private http: HttpClient) {}


  // consultation.service.ts
getConsByPatient(patientId: string): Observable<Consultation[]> {
  return this.http.get<Consultation[]>(`${this.apiUrl}/consultation/${patientId}`);
}

createCons(cons: Consultation): Observable<Consultation> {
  return this.http.post<Consultation>(`${this.apiUrl}/createCons`,cons);
}

// consultation.service.ts
getByPatientDoc(patientId: string): Observable<DocumentMedical | null> {
  return this.http.get<DocumentMedical>(`${this.apiUrl}/patient/${patientId}`)
    .pipe(
      catchError(err => {
        if (err.status === 404) {
          return of(null); // Pas de dossier → on retourne null
        }
        throw err;
      })
    );
}



createDoc(cons: DocumentMedical): Observable<DocumentMedical> {
  return this.http.post<DocumentMedical>(`${this.apiUrl}/createDoc`,cons);
}



updateDoc(doc: DocumentMedical): Observable<DocumentMedical> {
    return this.http.put<DocumentMedical>(`${this.apiUrl}/updateDoc/${doc.id}`, doc);
  }

}
