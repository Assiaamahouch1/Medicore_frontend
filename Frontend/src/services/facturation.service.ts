import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Facturation {
  idFacture?: string;
  montant?: number;
  modePaiement: string;
  rendezVousId: number;
  date:string
}

@Injectable({
  providedIn: 'root'
})
export class FacturationService {

  private apiUrl = 'http://localhost:8081/factures';

  constructor(private http: HttpClient) {}

  create(facturation: Facturation): Observable<Facturation> {
    return this.http.post<Facturation>(this.apiUrl, facturation);
  }

  update(id: string, facturation: Facturation): Observable<Facturation> {
    return this.http.put<Facturation>(`${this.apiUrl}/${id}`, facturation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
 restore(id: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/restore/${id}`, {});
}


  getById(id: string): Observable<Facturation> {
    return this.http.get<Facturation>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Facturation[]> {
    return this.http.get<Facturation[]>(`${this.apiUrl}/all`);
  }
  getAllNoActif(): Observable<Facturation[]> {
    return this.http.get<Facturation[]>(`${this.apiUrl}/allNoActif`);
  }
}
