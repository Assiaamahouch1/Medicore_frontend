export interface Cabinet {
  id?: number;
  logo?: string;
  nom: string;
  specialite?: string;
  adresse?: string;
  tel?: string;
  service_actif?: boolean;
  date_expiration_service?: string; // ISO date (yyyy-MM-dd)
}

export interface SubscriptionStatus {
  active: boolean;
  expired: boolean;
  daysRemaining: number;
}