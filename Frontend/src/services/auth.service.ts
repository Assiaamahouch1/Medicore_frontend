// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthAdmin {
  id?: number;
  avatar?: string;
  nom: string;
  prenom: string;
  numTel: string;
  username: string;
  role?: any;
  actif?: boolean;
  cabinetId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  getCurrentAuth(): Observable<AuthAdmin> {
    return this.http.get<AuthAdmin>(`${this.apiUrl}/me`);
  }

  updateCurrentAuth(id: number, superAdmin: Partial<AuthAdmin>): Observable<AuthAdmin> {
    return this.http.put<AuthAdmin>(`${this.apiUrl}/${id}`, superAdmin);
  }

  uploadImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id.toString());
    
    return this.http.put(`${this.apiUrl}/image`, formData, {
      responseType: 'text'
    });
  }

  /**
   * Construire l'URL de l'avatar intelligemment
   */
  getAvatar(avatarValue: string): string {
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (avatarValue.startsWith('http://') || avatarValue.startsWith('https://')) {
      return avatarValue;
    }
    
    // Si c'est un chemin qui commence par /
    if (avatarValue.startsWith('/')) {
      return `http://localhost:8080${avatarValue}`;
    }
    
    // Si c'est juste un nom de fichier
    return `${this.apiUrl}/image/${avatarValue}`;
  }

  /**
   * Récupérer l'image en Blob
   */
  getAvatarBlob(avatarValue: string): Observable<Blob> {
    const url = this.getAvatar(avatarValue);
    return this.http.get(url, { responseType: 'blob' });
  }
}