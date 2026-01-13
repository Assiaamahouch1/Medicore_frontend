import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cabinet {
  id?: number;
  logo?: string;
  nom: string;
  specialite?: string;
  adresse?: string;
  tel?: string;
  service_actif?: boolean;
  date_expiration_service?: string; // ISO yyyy-MM-dd
}

export interface SubscriptionStatus {
  active: boolean;
  expired: boolean;
  daysRemaining: number;
}

export interface AdminDashboardStats {
  totalCabinets: number;
  cabinetsActifs: number;
  cabinetsInactifs: number;
  cabinetsExpirantBientot: number;
  repartitionParSpecialite: { [key: string]: number };
  cabinetsExpires: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CabinetService {
  // API Gateway (même approche que AdminService)
  private apiUrl = 'http://localhost:8081/cabinets';

  constructor(private http: HttpClient) {}

  // --- CRUD (style AdminService) ---
  getAllCabinets(): Observable<Cabinet[]> {
    return this.http.get<Cabinet[]>(this.apiUrl);
  }

  getCabinetById(id: number): Observable<Cabinet> {
    return this.http.get<Cabinet>(`${this.apiUrl}/${id}`);
  }

  createCabinet(cabinet: Cabinet): Observable<Cabinet> {
    return this.http.post<Cabinet>(this.apiUrl, cabinet);
  }

  updateCabinet(id: number, cabinet: Cabinet): Observable<Cabinet> {
    return this.http.put<Cabinet>(`${this.apiUrl}/${id}`, cabinet);
  }

  deleteCabinet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Alias pour compatibilité avec tes composants ---
  list(q?: string, page = 0, size = 10, sort = 'nom'): Observable<any> {
    // Retourne Page<Cabinet> (ou array) selon ton backend; on garde any pour compat avec ton code
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (q && q.trim().length) params = params.set('q', q.trim());
    return this.http.get<any>(this.apiUrl, { params });
  }
  get(id: number) { return this.getCabinetById(id); }
  create(body: Partial<Cabinet>) { return this.createCabinet(body as Cabinet); }
  update(id: number, body: Partial<Cabinet>) { return this.updateCabinet(id, body as Cabinet); }
  delete(id: number) { return this.deleteCabinet(id); }

  // --- Activation / Désactivation ---
  activateCabinet(id: number): Observable<Cabinet> {
    return this.http.post<Cabinet>(`${this.apiUrl}/${id}/activate`, {});
  }
  deactivateCabinet(id: number): Observable<Cabinet> {
    return this.http.post<Cabinet>(`${this.apiUrl}/${id}/deactivate`, {});
  }
  // Alias
  activate(id: number) { return this.activateCabinet(id); }
  deactivate(id: number) { return this.deactivateCabinet(id); }

  // --- Abonnement ---
  renewSubscription(id: number, months: number): Observable<Cabinet> {
    return this.http.post<Cabinet>(`${this.apiUrl}/${id}/subscription/renew`, { months });
  }
  setExpiration(id: number, expirationDate: string): Observable<Cabinet> {
    return this.http.post<Cabinet>(`${this.apiUrl}/${id}/subscription/set-expiration`, { expirationDate });
  }
  getSubscriptionStatus(id: number): Observable<SubscriptionStatus> {
    return this.http.get<SubscriptionStatus>(`${this.apiUrl}/${id}/subscription/status`);
  }
  // Alias
  status(id: number) { return this.getSubscriptionStatus(id); }

  // --- Upload / récupération du logo (si implémenté côté backend) ---
  uploadLogo(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id.toString());
    return this.http.put<string>(`${this.apiUrl}/logo`, formData, {
      responseType: 'text' as 'json'
    });
  }

  getLogo(logoFilename: string): Observable<Blob> {
    if (logoFilename.startsWith('http')) {
      return this.http.get(logoFilename, { responseType: 'blob' });
    }
    return this.http.get(`${this.apiUrl}/logo/${logoFilename}`, { responseType: 'blob' });
  }

  // Récupérer les cabinets qui expirent bientôt (alertes admin)
  getExpiringCabinets(days: number = 7): Observable<Cabinet[]> {
    return this.http.get<Cabinet[]>(`${this.apiUrl}/alerts/expiring`, {
      params: new HttpParams().set('days', days.toString())
    });
  }

  // ============ DASHBOARD ADMIN STATS ============

  /**
   * Récupère les statistiques globales pour le dashboard SuperAdmin
   */
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }

  /**
   * Récupère les statistiques d'un cabinet spécifique (pour Admin de cabinet)
   */
  getCabinetStats(cabinetId: number): Observable<Cabinet> {
    return this.http.get<Cabinet>(`${this.apiUrl}/stats/cabinet/${cabinetId}`);
  }
}