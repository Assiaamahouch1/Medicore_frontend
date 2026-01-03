// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthAdmin {
  id?: number;
  avatar?: string;
  nom: string;
  prenom: string;
  numTel: string;
  username: string;
  role: any;
  actif?: boolean;
  cabinetId?: number;
}
export interface RegisterRequest {
  username: string;
  password: string;
  nom: string;
  prenom: string;
  numTel?: string;
  signature?: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
  cabinetId?: number;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<string> {
    const payload = {
      username: username,
      password: password
    };

    return this.http.post<string>(`${this.apiUrl}/login`, payload, {
      responseType: 'text' as 'json'
    });
  }

setToken(token: string): void {
  sessionStorage.setItem('token', token);
}

getToken(): string | null {
  return sessionStorage.getItem('token');
}

logout(): void {
  sessionStorage.removeItem('token');
  this.router.navigate(['/signin']);
}
isLoggedIn(): boolean {
  return !!sessionStorage.getItem('token'); // ou un autre moyen d'auth
}


  // --- Mot de passe oublié ---
  forgotPassword(username: string): Observable<string> {
    const payload = { username };
    return this.http.post<string>(`${this.apiUrl}/forgot-password`, payload, {
      responseType: 'text' as 'json'
    });
  }

 resetPassword(token: string, password: string, confirmPassword: string): Observable<string> {
  const payload = { password, confirmPassword };
  return this.http.post<string>(`${this.apiUrl}/reset-password/${token}`, payload, {
    responseType: 'text' as 'json'
  });
}

  getCurrentAuth(): Observable<AuthAdmin> {
    return this.http.get<AuthAdmin>(`${this.apiUrl}/me`);
  }

  updateCurrentAuth(id: number, superAdmin: Partial<AuthAdmin>): Observable<AuthAdmin> {
    return this.http.put<AuthAdmin>(`${this.apiUrl}/superadmin/${id}`, superAdmin);
  }

  uploadImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id.toString());
    
    return this.http.put(`${this.apiUrl}/superadmin/image`, formData, {
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
      return `http://localhost:8081${avatarValue}`;
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
  getAvatarSuperAdmin(avatarValue: string): string {
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (avatarValue.startsWith('http://') || avatarValue.startsWith('https://')) {
      return avatarValue;
    }
    
    // Si c'est un chemin qui commence par /
    if (avatarValue.startsWith('/')) {
      return `http://localhost:8081${avatarValue}`;
    }
    
    // Si c'est juste un nom de fichier
    return `${this.apiUrl}/superadmin/image/${avatarValue}`;
  }

  /**
   * Récupérer l'image en Blob
   */
  getAvatarBlobSuperAdmin(avatarValue: string): Observable<Blob> {
    const url = this.getAvatarSuperAdmin(avatarValue);
    return this.http.get(url, { responseType: 'blob' });
  }
   // Enregistrer un nouvel utilisateur (médecin, secrétaire, etc.)
  register(request: RegisterRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, request, {
      responseType: 'text' as 'json'
    });
  }
}