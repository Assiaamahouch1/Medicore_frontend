// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Admin {
  id?: number;
  avatar?: string;
  nom: string;
  prenom: string;
  numTel: string;
  username: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/auth'; // Adapter selon ton port

  constructor(private http: HttpClient) {}

  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.apiUrl);
  }

  getAdminById(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/${id}`);
  }

  createAdmin(admin: Admin): Observable<Admin> {
    return this.http.post<Admin>(this.apiUrl, admin);
  }

  updateAdmin(id: number, admin: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/${id}`, admin);
  }

  deleteAdmin(id: number): Observable<void> {
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