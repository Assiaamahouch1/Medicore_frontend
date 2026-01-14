import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medicament {
  id?: string;
  nom: string;
  description: string;
  atcCode: string;
  forme: string;
  dosageUnite: string;
}



@Injectable({ providedIn: 'root' })
export class MedicamentService {
  private apiUrl = 'http://localhost:8081/medicaments'; // Port de ton microservice

  constructor(private http: HttpClient) {}

   getAll(): Observable<Medicament[]> {
      return this.http.get<Medicament[]>(`${this.apiUrl}`);
    }


     delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
      }
suggest(query: string, limit: number = 10): Observable<Medicament[]> {
    const params = new HttpParams()
      .set('q', query || '')
      .set('limit', limit.toString());
    
    // L'endpoint /suggest retourne maintenant une liste complète de Medicament
    return this.http.get<Medicament[]>(`${this.apiUrl}/suggest`, { params });
  }
}