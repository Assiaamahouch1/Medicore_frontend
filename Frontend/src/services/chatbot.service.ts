import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatbotSearchRequest {
  specialite?: string;
  ville?: string;
  nomMedecin?: string;
}

export interface ChatbotCabinetResult {
  id: number;
  nom: string;
  specialite: string;
  adresse: string;
  ville: string;
  tel: string;
  logo: string;
  horairesDisponibles: string[];
}

export interface ChatbotSearchResponse {
  success: boolean;
  message: string;
  totalResults: number;
  cabinets: ChatbotCabinetResult[];
}

export interface ChatbotWelcome {
  message: string;
  nextStep: string;
  question: string;
  options: string[];
}

export type ChatbotStep = 'welcome' | 'specialite' | 'ville' | 'nom' | 'results' | 'details';

export interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  cabinets?: ChatbotCabinetResult[];
  isTyping?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8081/api/chatbot';

  constructor(private http: HttpClient) {}

  /**
   * Récupère le message de bienvenue
   */
  getWelcome(): Observable<ChatbotWelcome> {
    return this.http.get<ChatbotWelcome>(`${this.apiUrl}/welcome`);
  }

  /**
   * Récupère les spécialités disponibles
   */
  getSpecialites(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/specialites`);
  }

  /**
   * Récupère les villes disponibles
   */
  getVilles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/villes`);
  }

  /**
   * Recherche des cabinets
   */
  searchCabinets(request: ChatbotSearchRequest): Observable<ChatbotSearchResponse> {
    return this.http.post<ChatbotSearchResponse>(`${this.apiUrl}/search`, request);
  }

  /**
   * Récupère les horaires disponibles pour un cabinet
   */
  getHoraires(cabinetId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/horaires/${cabinetId}`);
  }
}

