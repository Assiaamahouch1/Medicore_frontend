import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CabinetService, AdminDashboardStats } from '../../../services/cabinet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: AdminDashboardStats | null = null;
  loading = true;
  error: string | null = null;
  today = new Date();

  constructor(private cabinetService: CabinetService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    console.log('Chargement des statistiques du dashboard...');
    console.log('Service URL:', 'http://localhost:8081/cabinets/admin/dashboard/stats');
    
    this.cabinetService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Données reçues avec succès:', JSON.stringify(data, null, 2));
        console.log('Type de stats:', typeof data);
        console.log('Stats object:', data);
        this.stats = data;
        this.loading = false;
        console.log('loading =', this.loading, 'error =', this.error, 'stats =', this.stats);
      },
      error: (err) => {
        console.error('❌ Erreur dashboard complète:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('URL:', err.url);
        console.error('Error object:', JSON.stringify(err, null, 2));
        this.error = `Erreur lors du chargement des statistiques: ${err.status || 'Inconnue'} - ${err.message || 'Vérifiez la console pour plus de détails'}`;
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadStats();
  }

  getSpecialiteEntries(): Array<{key: string, value: number}> {
    if (!this.stats?.repartitionParSpecialite) return [];
    return Object.entries(this.stats.repartitionParSpecialite)
      .map(([key, value]) => ({ key, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }

  getProgressColor(value: number): string {
    const colors = [
      '#3498db', '#27ae60', '#f39c12', '#e74c3c', 
      '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
    ];
    return colors[value % colors.length];
  }

  getActivePercentage(): number {
    if (!this.stats || this.stats.totalCabinets === 0) return 0;
    return (this.stats.cabinetsActifs / this.stats.totalCabinets * 100);
  }

  getInactivePercentage(): number {
    if (!this.stats || this.stats.totalCabinets === 0) return 0;
    return (this.stats.cabinetsInactifs / this.stats.totalCabinets * 100);
  }
  getPieChartData(): Array<{label: string, value: number, percentage: number, color: string}> {
    if (!this.stats || !this.stats.repartitionParSpecialite) return [];
    const entries = this.getSpecialiteEntries();
    const total = this.stats.totalCabinets;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];
    
    return entries.map((item, index) => ({
      label: item.key,
      value: item.value,
      percentage: total > 0 ? (item.value / total * 100) : 0,
      color: colors[index % colors.length]
    }));
  }
  getDonutChartPath(index: number, total: number, radius: number = 80, innerRadius: number = 50): string {
    if (total === 0) return '';
    
    const data = this.getPieChartData();
    if (index >= data.length) return '';
    
    let currentAngle = -90; // Commencer en haut
    
    // Calculer l'angle de départ
    for (let i = 0; i < index; i++) {
      currentAngle += (data[i].percentage / 100) * 360;
    }
    
    const percentage = data[index].percentage;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle * (Math.PI / 180);
    const endAngle = (currentAngle + angle) * (Math.PI / 180);
    
    const centerX = 100;
    const centerY = 100;
    
    // Points extérieurs
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    // Points intérieurs
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    // Créer le chemin pour le segment du donut
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // Obtenir la valeur maximale pour le graphique en barres
  getMaxValue(): number {
    if (!this.stats) return 1;
    return Math.max(
      this.stats.cabinetsActifs,
      this.stats.cabinetsInactifs,
      this.stats.cabinetsExpires,
      this.stats.cabinetsExpirantBientot
    ) || 1;
  }

  // Obtenir un gradient de couleur
  getGradientColor(color: string): string {
    const gradients: { [key: string]: string } = {
      '#10b981': 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      '#6b7280': 'linear-gradient(180deg, #6b7280 0%, #4b5563 100%)',
      '#ef4444': 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
      '#f59e0b': 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
    };
    return gradients[color] || color;
  }
}

