// src/app/services/secretaire.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Secretaire {
  id?: number;
  avatar?: string;
  nom: string;
  prenom: string;
  numTel: string;
  username: string;
  password?: string;
  cabinetId?: number;
  
}

@Injectable({
  providedIn: 'root'
})
export class SecretaireService {
  private apiUrl = 'http://localhost:8081/api/auth/secr'; // Adapter selon ton port

  constructor(private http: HttpClient) {}

  getAllSecretaires(): Observable<Secretaire[]> {
    return this.http.get<Secretaire[]>(this.apiUrl);
  }

  getSecretaireById(id: number): Observable<Secretaire> {
    return this.http.get<Secretaire>(`${this.apiUrl}/${id}`);
  }

  createSecretaire(secretaire: Secretaire): Observable<Secretaire> {
    return this.http.post<Secretaire>(this.apiUrl, secretaire);
  }

  updateSecretaire(id: number, secretaire: Secretaire): Observable<Secretaire> {
    return this.http.put<Secretaire>(`${this.apiUrl}/${id}`, secretaire);
  }

  deleteSecretaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id.toString());
    
    return this.http.put<string>(`${this.apiUrl}/image`, formData, {
      responseType: 'text' as 'json'
    });
  }

  getAvatar(avatarFilename: string): Observable<Blob> {
    if (avatarFilename.startsWith('http')) {
      return this.http.get(avatarFilename, { responseType: 'blob' });
    }
    
    const url = `${this.apiUrl}/image/${avatarFilename}`;
    return this.http.get(url, { responseType: 'blob' });
}

}